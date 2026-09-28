# AAIL Webpage

서울대학교 항공우주공학과 **Aerospace Autonomy and Intelligence Laboratory (AAIL)** 공식 홈페이지입니다.

- 사이트: https://aail-snu.github.io/aail-webpage/ 혹은 https://aail.snu.ac.kr
- [Eleventy](https://www.11ty.dev/) 기반 정적 사이트이며, `main`에 push하면 GitHub Actions가 자동으로 배포합니다.

---

## 업데이트 매뉴얼

사이트 내용은 전부 `src/data/` 안에 있습니다. 

| 수정할 내용 | 파일 |
| --- | --- |
| 교수님 프로필 | `src/data/professor/` |
| 구성원 목록 | `src/data/members.json` |
| 연구 소개 | `src/data/research/` |
| 논문 | `src/data/publications.bib` |
| 연구 과제 | `src/data/projects.json` |
| 세미나 | `src/data/seminars.json` |
| 강의 | `src/data/courses.json` |
| 뉴스 / 갤러리 | `src/data/news/`, `src/data/gallery/` |

이미지는 `images/` 폴더에 넣고, 데이터 파일에서는 `images/members/xxx.jpg`처럼 상대 경로로 적으면 됩니다.

### 논문 추가

`src/data/publications.bib`에 BibTeX 형식으로 추가하면 빌드할 때 자동으로 목록에 반영됩니다. 정렬(연도 → 월)도 자동이라 파일 안 위치는 상관없습니다.

`@` 뒤에 오는 타입에 따라 Publications 페이지의 탭이 정해집니다.

| 타입 | 분류(탭) | 주요 필드 |
| --- | --- | --- |
| `@article` | Journal | `journal`, `volume`, `number`, `pages` |
| `@inproceedings` | Conference | `booktitle`, `address` |
| `@incollection` | Korean Journals & Conferences | `booktitle`, `address` |
| `@unpublished` | Preprint | `note` (예: `arXiv:2603.05762`) |
| `@techreport` | Technical Report | `institution`, `number` |
| `@phdthesis` | Dissertation | `school` |
| `@misc` | (표시 안 됨, 특허 등) | |

공통으로 `author`, `title`, `year`, `month`, `url`을 적어주세요. `url`이 DOI 링크면 DOI도 같이 표시됩니다.


```bibtex
# 예시 
@article{J_GHong_2026_Example,
  author  = {Hong, Gildong and Cho, Namhoon},
  title   = {Example Title},
  journal = {Control Engineering Practice},
  volume  = {173},
  number  = {106961},
  month   = {March},
  year    = {2026},
  url     = {https://doi.org/10.xxxx/xxxxx}
}
```

- 저자는 `성, 이름` 형식으로 쓰고 `and`로 구분합니다.
- 키(`J_NCho_2026_Example`)는 파일 안에서 겹치지만 않으면 됩니다.

### 뉴스 / 갤러리 추가

`src/data/news/` 또는 `src/data/gallery/`에 `.md` 파일을 새로 만들면 됩니다. 기존 파일을 복사해서 고치는 게 제일 편합니다.

```markdown
---
title: IFAC WC 2026 Attendance
cover: "images/gallery/ifac-2026-attendance.jpg"
date: 2026-08-24
---

We attended IFAC WC 2026!
```

---

## 로컬에서 실행

```bash
git clone https://github.com/AAIL-SNU/aail-webpage.git
cd aail-webpage
npm install
npm run dev
```

http://localhost:8080/aail-webpage/ 에서 확인할 수 있고, 파일을 저장하면 바로 반영됩니다.

## 배포

로컬에서 수정한 뒤 아래 둘 중 하나로 `main`에 올리면 GitHub Actions가 자동으로 배포합니다(1~2분 소요). 진행 상황은 [Actions 탭](https://github.com/AAIL-SNU/aail-webpage/actions)에서 볼 수 있습니다.

**1. 배포 스크립트 사용 (추천)**

```bash
./deploy.sh "커밋 메시지"
```

빌드 테스트 → 전체 변경사항 커밋 → push까지 한 번에 합니다. 빌드가 실패하면 커밋하지 않고 멈춥니다.

**2. 직접 commit & push**

```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```
