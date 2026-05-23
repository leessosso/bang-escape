# CCTV 영상 (오프라인 재생)

`final-cctv.mp4` — Stage 7 최종 CCTV 복구 화면용 영상.

원본: YouTube `NL__LCwVyas` (앱에서는 YouTube API 없이 이 파일만 사용)

재다운로드 (YouTube 원본은 360p만 제공 → 720p 업스케일):

```bash
python3 -m yt_dlp --extractor-args "youtube:player_client=android" \
  -f "best[ext=mp4]/best" \
  -o "public/videos/final-cctv-src.%(ext)s" \
  "https://www.youtube.com/watch?v=NL__LCwVyas"

ffmpeg -y -i public/videos/final-cctv-src.mp4 \
  -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -crf 20 \
  -c:a aac -b:a 128k \
  public/videos/final-cctv.mp4
```
