# demo-video-creator

[English](README.md) · **한국어**

제품 URL 하나를 주면 **16:9 데모·런치 영상**을 완성해 주는 에이전트 스킬입니다. 실제 UI 캡처, 실제 결과물 영상, 끊김 없는 나레이션, 비트에 맞춘 모션, 임팩트 효과, 마스터링한 믹스까지 들어간 mp4 한 개가 나옵니다.

15초 티저부터 90초 SaaS 사용법 영상까지 **데모 영상 9가지 케이스**를 다룹니다. AI 툴, 웹앱, CLI, 모바일 앱, 브라우저 익스텐션, 마켓플레이스에 쓸 수 있고, 모든 케이스를 **영어판과 한국어판**으로 만들 수 있습니다. 아래 두 영상이 이 스킬로 만든 결과물입니다.

### English (40초)

https://github.com/user-attachments/assets/2bb0fb3f-6a43-4286-9b37-9b6d64b53fde

### 한국어 (45초)

https://github.com/user-attachments/assets/3db6c46b-8cc2-4b96-a896-14263fa45057

1080p 원본: [`media/demo_en.mp4`](media/demo_en.mp4) · [`media/demo_ko.mp4`](media/demo_ko.mp4)

두 영상 모두 [Evals](https://evals.ag) 데모입니다(`ai-output-battle` 케이스). 스토리와 모션 문법은 같고, 목소리·카피·한글 서체만 바뀝니다.

## 설치

```bash
npx skills add chacha95/demo-video-creator
```

설치한 뒤 에이전트에게 이렇게 요청하면 됩니다.

```text
https://your-product.com 한국어 버전으로 1분짜리 가로 데모 영상 뽑아줘
```

```text
이번에 나온 Auto-summary 기능만 30초 신기능 영상으로 뽑아줘
```

```text
우리 iOS 앱 소개 영상 가로로 40초짜리, 시뮬레이터에서 찍어줘
```

레퍼런스 영상도 받습니다. "이 영상 느낌으로 우리 제품 영상 만들어줘"라고 하면서 URL이나 파일을 함께 주면 됩니다. 한 번에 끝까지 맡기려면 [`BRIEF_TEMPLATE.md`](skills/demo-video-creator/references/BRIEF_TEMPLATE.md)를 채워서 붙여 넣으세요.

## 케이스

스킬이 제품과 요청을 보고 케이스 하나를 고른 뒤, 그 플레이북대로 훅·스토리·캡처·길이를 정합니다. 모션·나레이션·믹스·QA 규칙은 모든 케이스가 같이 씁니다.

| 케이스 | 대상 | 길이 | 첫 3초 |
|---|---|---|---|
| [`ai-output-battle`](skills/demo-video-creator/references/cases/ai-output-battle.md) | AI 생성 툴, 모델 비교 | 45~65초 | 같은 프롬프트로 나온 가장 다른 실제 결과물 두 개를 나란히 |
| [`saas-workflow`](skills/demo-video-creator/references/cases/saas-workflow.md) | 대시보드, CRM, 문서, 협업툴 | 45~75초 (사용법 60~100초) | 실제 작업 하나가 끝난 결과 화면이 이미 움직이는 상태 |
| [`devtool-cli`](skills/demo-video-creator/references/cases/devtool-cli.md) | CLI, SDK, API, 코딩 에이전트 | 40~60초 | 배포된 결과물 → 명령어 한 줄 |
| [`mobile-app`](skills/demo-video-creator/references/cases/mobile-app.md) | iOS / Android 앱 | 30~60초 | 앱의 핵심 화면을 조작하는 순간 |
| [`browser-extension`](skills/demo-video-creator/references/cases/browser-extension.md) | 크롬 익스텐션, 페이지 내 어시스턴트 | 30~45초 | 익숙한 페이지가 익스텐션으로 바뀌는 순간 |
| [`marketplace-catalog`](skills/demo-video-creator/references/cases/marketplace-catalog.md) | 스킬·템플릿·에셋 스토어 | 45~60초 | 실제 아이템 벽 + 사이트의 실제 개수 |
| [`feature-launch`](skills/demo-video-creator/references/cases/feature-launch.md) | 신기능 하나, 체인지로그 | 20~40초 | 신기능이 이미 일하고 있는 화면 |
| [`teaser`](skills/demo-video-creator/references/cases/teaser.md) | 런칭 전 티저, SNS 컷다운 | 12~20초 | 가장 강한 컷 하나, 음악 주도 |
| [`before-after`](skills/demo-video-creator/references/cases/before-after.md) | 자동화, 받아쓰기, 어시스턴트 | 30~50초 | 수작업 vs 제품, 분할 화면, 실측 타이머 |

음악 프롬프트와 길이별 대본 분량은 [`CASES.md`](skills/demo-video-creator/references/CASES.md)에 있습니다.

## 결과물

| | |
|---|---|
| 규격 | 1920×1080, 30fps, H.264 + AAC 192k |
| 길이 | 케이스별 12~100초 |
| 음량 | 마스터 −14 LUFS, 나레이션이 음악보다 앞에 들림 |
| 언어 | 영어(ElevenLabs *Will*) 또는 한국어(ElevenLabs *Choi*, Pretendard 서체). 두 버전 모두 제품 UI 용어는 영어 그대로 씁니다. |
| 프로젝트 폴더 | `videos/<이름>/` 아래 `SCRIPT.md`, `DESIGN.md`, `DECISIONS.md`, HyperFrames 빌드, QA 스트립, `renders/<이름>.mp4` |

## 준비물

### API 키 (필수)

| 키 | 용도 | 받는 법 |
|---|---|---|
| `ELEVENLABS_API_KEY` | 나레이션(`eleven_v4`, `/with-timestamps`), 배경음악(ElevenLabs Music), 효과음 킷(Sound Effects) | 1. [elevenlabs.io](https://elevenlabs.io)에 로그인합니다.<br>2. 왼쪽 아래 프로필 → **Developers / API Keys** → **Create API Key**를 누릅니다.<br>3. 권한에서 **Text to Speech**, **Music**, **Sound Effects**, **Voices (read)**를 켭니다.<br>4. 키를 복사합니다. 키는 한 번만 보여 줍니다. |

음악 생성(Music)은 유료 플랜이 필요할 수 있습니다. 영상 한 편에 나레이션 1~4테이크, 음악 후보 2~3개, 효과음 킷 1세트(다음 영상에서도 재사용)를 생성합니다.

에이전트를 실행하는 프로젝트 루트의 `.env` 파일에 키를 넣으세요.

```bash
ELEVENLABS_API_KEY=여기에_키
```

키를 채팅창에 붙여넣지 마세요. `.env`는 git에 올라가지 않게 해 두세요(`echo .env >> .gitignore`). 스킬은 처음 실행할 때 `scripts/preflight.sh`로 키를 출력하지 않고 API에 확인합니다. 빠진 게 있으면 작업을 시작하기 전에 한 번에 모아서 알려 줍니다.

### 도구

| 도구 | 용도 | 설치 (macOS) |
|---|---|---|
| Node.js 20+ | HyperFrames 렌더, Playwright 캡처 스크립트 | `brew install node` |
| ffmpeg / ffprobe | 리타이밍, 임팩트 효과, 믹스, QA 스트립 | `brew install ffmpeg` |
| Python 3 + numpy | 비트 감지, 모션 QA, 믹스 검사 | `pip3 install numpy` |
| Playwright + Chromium | 4× DPR UI 캡처, 조작 흐름 녹화, 결과물 화면 녹화 | 저장소 루트에서 `npm i -D playwright && npx playwright install chromium` |
| HyperFrames | 컴포지션 빌드와 렌더 (자동으로 받아 옴) | `npx --yes hyperframes@0.8.101` |
| whisper.cpp *(선택)* | 최종 믹스를 로컬 Whisper로 검사 (키 필요 없음) | `brew install whisper-cpp` |
| yt-dlp *(선택)* | 레퍼런스 영상 다운로드 | `brew install yt-dlp` |
| Xcode 시뮬레이터 *(mobile-app)* | 상태바를 정리한 실제 앱 녹화 | Xcode |
| vhs *(선택, devtool-cli)* | 실제 터미널 녹화 | `brew install vhs` |

Claude Code 기준으로 작성한 스킬입니다. `hyperframes-core` 스킬이 설치돼 있으면 그것도 함께 참고합니다(`npx skills add heygen-com/hyperframes`).

### 제품 쪽 조건

- **캡처할 수 있는 실제 URL(또는 시뮬레이터 빌드)이 있어야 합니다.** 화면에 나오는 UI는 전부 실제 캡처이고, 목업은 쓰지 않습니다. 로그인이 필요한 페이지는 로그인된 세션을 쓰거나 공개 페이지로 대신합니다.
- **움직이는 게 있어야 합니다.** 결과물, 실제 조작 흐름, 실행되는 명령어, 바뀌는 데이터 같은 것들입니다. 정적인 웹사이트 스크린샷은 일부러 쓰지 않습니다.
- **실제 숫자만 씁니다.** 화면에 나오는 이름, 수치, 기능은 모두 캡처에 실제로 있는 것이어야 합니다. SaaS 영상은 데모 워크스페이스를 만들어서 찍고, 실제 고객 데이터는 절대 쓰지 않습니다.

## 구성

```
skills/demo-video-creator/
├── SKILL.md                    파이프라인 + 사용자가 승인·반려한 모든 규칙
├── references/
│   ├── CASES.md, cases/*.md    9가지 케이스 플레이북
│   ├── MOTION_RULES.md         모션 문법
│   ├── MOTION_SPEC.md          승인된 영상에서 프레임 단위로 잰 수치
│   ├── DEVICES.md              motion-kit.js API
│   ├── BRIEF_TEMPLATE.md       한 번에 붙여 넣는 원샷 브리프
│   ├── looks/evals.md          Evals 하우스 스타일
│   └── examples/               DESIGN, SCRIPT, 브리프 예시
├── assets/
│   ├── themes/*.json           evals · paper-signal · clean-violet · terminal-night · soft-mobile · editorial-cream
│   ├── starter/                HyperFrames 프로젝트 (일시정지 타임라인 1개, 샘플 샷 5개)
│   └── templates/              SCRIPT / DESIGN / DECISIONS / post.json / flow.json / ui.json / demo.tape
└── scripts/
    ├── preflight.sh, new_project.sh, fetch_fonts.sh
    ├── capture_ui.mjs, rec_flow.mjs, rec_output.mjs, rec_scroll.mjs, rec_ios.sh, dedupe.sh
    ├── vo3_gen.py, music_gen.py, sfx_gen.py, beats.py, bars.py, music_fit.py
    ├── motion-kit.js           결정적 모션 디바이스 13종 + 테마
    ├── post.py                 리타이밍, 임팩트 효과, 덕킹, 효과음, −14 LUFS (설정: post.json)
    └── qa_check.py, motion.py, strip.sh, sync_audit.mjs, mixcheck.py
```

## 작동 방식

```
케이스 → 브리프 → 레퍼런스 SPEC → SCRIPT.md → DESIGN.md → 실제 UI·결과물 캡처
→ 나레이션 원테이크 → 음악 + 효과음 → HyperFrames 빌드 (나레이션 주도, 비트 고정)
→ fps 재렌더로 배속 → 후반 (임팩트 효과, 믹스) → QA → renders/<이름>.mp4
```

핵심은 네 가지입니다.
- **첫 프레임이 곧 결과입니다.** 케이스마다 첫 3초에 보여 줄 장면이 정해져 있고, 언제나 실제 결과물입니다. 로고나 슬로건으로 시작하지 않습니다.
- **모션은 형용사가 아니라 측정한 수치로 맞춥니다.** 카메라는 하나, 이징은 두 종류(snappy, floaty)만 씁니다. 나가는 동작의 속도를 다음 샷이 이어받고, 컷은 비트 ±1프레임에 맞춥니다. 자세한 규칙은 [`MOTION_RULES.md`](skills/demo-video-creator/references/MOTION_RULES.md)에 있습니다.
- **나레이션은 한 번에 통으로 녹음합니다.** 자르거나 늘이지 않습니다. 화면 글자는 목소리보다 0.05~0.20초 먼저 뜹니다.
- **납품 전에 QA를 합니다.** 납품 게이트(`qa_check.py`: 규격, 길이, 음량, 컷 수, 정지 구간), 모션 분석, 전환마다 16프레임 스트립, 단어마다 싱크 표, 샷마다 가장자리·모서리 마감 점검을 거칩니다.

전체 파이프라인은 [`SKILL.md`](skills/demo-video-creator/SKILL.md)에, 변경 내역은 [`CHANGELOG.md`](CHANGELOG.md)에 있습니다.

## 제약

- 가로 영상만 만듭니다. 9:16 쇼츠·릴스는 세로 전용 스킬을 쓰세요.
- 영상 한 편을 만드는 데 에이전트 세션이 길게 돕니다. 캡처, 렌더, 후반 작업, QA를 모두 거치기 때문입니다.
- 브랜드 로고와 결과물 영상의 권리는 각 소유자에게 있습니다. 보여 줄 권리가 있는 소재만 쓰세요.

## 라이선스

MIT
