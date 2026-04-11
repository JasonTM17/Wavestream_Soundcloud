# Hướng Dẫn Demo WaveStream

[English](./DEMO-WALKTHROUGH.md) | Tiếng Việt

Đây là một kịch bản demo ngắn gọn trong 5 đến 10 phút, phù hợp cho buổi walkthrough portfolio.

## Trước Khi Bắt Đầu

- Mở ứng dụng tại `http://localhost:3000`.
- Giữ Mailpit mở tại `http://localhost:8025`.
- Chuẩn bị sẵn các tài khoản seed:
  - Admin: `admin@wavestream.local` / `Admin123!`
  - Creator: `solis@wavestream.demo` / `DemoPass123!`
  - Listener: `ivy@wavestream.demo` / `DemoPass123!`

## Luồng Demo

1. Bắt đầu ở landing page và chỉ ra các rail discovery công khai, featured artists và playlists.
2. Đăng nhập bằng tài khoản creator và cho thấy session vẫn còn khi chuyển qua app shell với sticky player và navigation dành cho creator.
3. Mở trang track, phát audio, rồi chỉ ra queue, progress bar, like, repost, comment và add-to-playlist.
4. Vào trang library để show phần summary của creator dashboard, listening history và các playlist do mình sở hữu.
5. Mở một playlist và minh họa các quyền edit, reorder, remove-track và delete của owner.
6. Chuyển sang tài khoản listener và cho thấy public browsing vẫn hoạt động, trong khi các khu vực chỉ dành cho creator vẫn bị bảo vệ.
7. Đăng nhập bằng tài khoản admin và mở moderation queue để show report previews, target labels và deep links.
8. Mở Mailpit và show luồng reset mật khẩu chạy end-to-end.

## Các Điểm Nên Nhấn Mạnh

- Sản phẩm được xây như một monorepo thật, không phải mock frontend.
- Audio playback an toàn khi chuyển route và được giữ bằng persistent player state.
- Auth dùng refresh-cookie bootstrap nên trải nghiệm giống một app thật.
- Media upload, playlist và moderation đều map sang các flow backend thật.

## Câu Kết

Nếu cần một câu kết ngắn, có thể dùng:

> WaveStream là một demo nền tảng âm nhạc theo hướng production, có auth thật, storage thật, playback thật, playlist thật, moderation thật và triển khai local bằng Docker.
