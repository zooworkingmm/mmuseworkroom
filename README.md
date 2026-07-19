# 포트폴리오 사이트 (Option A / Option B)

빌드 도구 없이 브라우저에서 바로 여는 정적 사이트입니다.

## 폴더 구조

```
portfolio-site/
  assets/
    data.js              ← 스튜디오 정보 + 3개 프로젝트 텍스트/이미지 목록 (여기 한 곳만 수정하면 A/B 둘 다 반영됨)
    images/               ← 웹용으로 리사이즈(최대 2000px)한 이미지
  option-a/                ← 원페이지 구조 (좌: 소개+리스트 / 우: 선택한 프로젝트)
  option-b/                ← 멀티페이지 구조 (홈 그리드 + 프로젝트별 페이지, 스토리보드 프레임 스타일)
```

## 실행 방법

폴더째로 더블클릭해서 여는 것도 되지만, 로컬 서버로 여는 걸 추천합니다 (일부 브라우저는 file:// 에서 fetch를 막을 수 있음):

```
cd portfolio-site
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/option-a/index.html` 또는
`http://localhost:8000/option-b/index.html` 접속.

## 꼭 교체해야 할 부분 (현재 임시 텍스트)

`assets/data.js` 안에:
- `STUDIO.name` — 현재 "OOO", 실제 스튜디오/디자이너명으로 교체
- `STUDIO.address / phone / email / site / sns` — 실제 연락처로 교체
- `STUDIO.about` — 소개 문구 검토
- 각 프로젝트의 `year`, `summary`, `description` — 실제 준공연도/소개글로 검토·수정
- 이미지 순서나 캡션(`images[].caption`)도 이 파일에서 바로 수정 가능

## 프로젝트 추가/삭제

`assets/data.js`의 `PROJECTS` 배열에 항목을 추가/삭제하면 Option A(리스트), Option B(홈 그리드 + 이전/다음 내비게이션) 모두 자동 반영됩니다. 단, Option B는 프로젝트별 페이지 파일(`option-b/{id}.html`)도 함께 추가해야 합니다 — 기존 파일을 복사해서 `renderProject("id")` 부분만 새 id로 바꾸면 됩니다.
