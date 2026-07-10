/* Minimal libespeak-ng -> WAV renderer.  Usage: espeak_tts <voice> <text> <out.wav>
 * Declares the few libespeak-ng symbols we need so no dev headers are required. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef int (*synth_cb)(short *, int, void *);
extern int  espeak_Initialize(int output, int buflength, const char *path, int options);
extern void espeak_SetSynthCallback(synth_cb cb);
extern int  espeak_SetVoiceByName(const char *name);
extern int  espeak_Synth(const void *text, unsigned long size, unsigned int position,
                         int position_type, unsigned int end_position, unsigned int flags,
                         unsigned int *unique_identifier, void *user_data);
extern int  espeak_Synchronize(void);
extern int  espeak_Terminate(void);

#define AUDIO_OUTPUT_SYNCHRONOUS 2
#define ESPEAK_CHARS_UTF8 1

static short *buf = NULL;
static size_t len = 0, cap = 0;

static int on_samples(short *wav, int numsamples, void *events) {
  (void)events;
  if (wav == NULL || numsamples <= 0) return 0;
  if (len + (size_t)numsamples > cap) {
    cap = (len + numsamples) * 2 + 4096;
    buf = realloc(buf, cap * sizeof(short));
  }
  memcpy(buf + len, wav, numsamples * sizeof(short));
  len += numsamples;
  return 0;
}

static void put32(FILE *f, unsigned v) { fputc(v & 255, f); fputc((v >> 8) & 255, f); fputc((v >> 16) & 255, f); fputc((v >> 24) & 255, f); }
static void put16(FILE *f, unsigned v) { fputc(v & 255, f); fputc((v >> 8) & 255, f); }

int main(int argc, char **argv) {
  if (argc < 4) { fprintf(stderr, "usage: %s <voice> <text> <out.wav>\n", argv[0]); return 2; }
  const char *voice = argv[1], *text = argv[2], *out = argv[3];

  int rate = espeak_Initialize(AUDIO_OUTPUT_SYNCHRONOUS, 0, "/usr/lib/x86_64-linux-gnu", 0);
  if (rate <= 0) { fprintf(stderr, "espeak init failed\n"); return 1; }
  espeak_SetSynthCallback(on_samples);
  if (espeak_SetVoiceByName(voice) != 0) fprintf(stderr, "warn: voice '%s' not set, using default\n", voice);
  espeak_Synth(text, strlen(text) + 1, 0, 0, 0, ESPEAK_CHARS_UTF8, NULL, NULL);
  espeak_Synchronize();
  espeak_Terminate();

  FILE *f = fopen(out, "wb");
  if (!f) { fprintf(stderr, "cannot open %s\n", out); return 1; }
  unsigned data_bytes = len * sizeof(short);
  fwrite("RIFF", 1, 4, f); put32(f, 36 + data_bytes); fwrite("WAVE", 1, 4, f);
  fwrite("fmt ", 1, 4, f); put32(f, 16); put16(f, 1); put16(f, 1);
  put32(f, rate); put32(f, rate * 2); put16(f, 2); put16(f, 16);
  fwrite("data", 1, 4, f); put32(f, data_bytes);
  fwrite(buf, sizeof(short), len, f);
  fclose(f);
  fprintf(stderr, "wrote %s (%zu samples @ %d Hz)\n", out, len, rate);
  return 0;
}
