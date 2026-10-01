---
name: create-pr
description: |
  현재 브랜치의 커밋을 분석해 코드 리뷰용 GitHub PR을 생성한다.
  본문은 references/의 템플릿(한국어/영문)으로 작성하며, 저장소에 따라 언어를 자동 선택한다.
  "PR 만들어줘", "PR 생성", "풀 리퀘스트 올려줘", "리뷰 요청 올려줘", "create a PR", "open a pull request", "/create-pr" 같은 요청에 활성화한다.
  커밋되지 않은 변경은 커밋하지 않고 보고만 하며, merge는 하지 않는다.
argument-hint: "[base 브랜치] [--draft]"
context: fork
---

# create-pr: 코드 리뷰용 PR 생성

이 스킬은 포크된 서브 에이전트에서 실행된다. 대화 맥락이 없으므로 **저장소 상태만으로 판단**하고, 사용자에게 질문하지 않는다. 진행이 불가능하면 멈추고 이유를 보고한다.

## 1. 사전 점검

```bash
gh auth status
git remote get-url origin
git status --short
git branch --show-current
```

다음 중 하나라도 해당하면 PR을 만들지 않고 이유를 보고한 뒤 끝낸다.

- `gh` 미인증, `origin` 리모트 없음.
- 커밋되지 않은 변경이 있음. 임의로 커밋하지 않는다. 파일 목록을 보고하고 `/commit` 실행을 권한다.
- base 브랜치 대비 새 커밋이 없음.

## 2. base / head 브랜치 결정

- base: 인자로 받은 브랜치, 없으면 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
- `git fetch origin <base>` 후 `git log --oneline origin/<base>..HEAD`로 PR에 들어갈 커밋을 확정한다.
- 현재 브랜치가 base와 같으면 새 브랜치를 만든다.
  - 이름: `<type>/<kebab-case-요약>` (예: `feat/prompt-length-limit`). type은 커밋 중 가장 비중이 큰 것.
  - `git switch -c <branch>`만 한다. 로컬 base 브랜치를 `reset`하지 않는다. 로컬 base가 origin보다 앞서 있다는 사실은 보고에 포함한다.
- `git push -u origin <head>`. force push는 하지 않는다.
- `gh pr list --head <head> --state open --json url`로 기존 PR이 있으면 새로 만들지 않고 그 URL을 보고한다.

## 3. 템플릿 언어 선택

`git remote get-url origin`의 `owner/repo`를 아래 목록과 비교한다.

| 저장소 | 템플릿 |
| --- | --- |
| `kju-lee/react-component-generator-261001` | `references/pr-template.ko.md` |
| 그 외 모든 저장소 | `references/pr-template.en.md` |

- 비교는 대소문자 무시, `.git` 접미사와 `https://github.com/`·`git@github.com:` 접두사를 제거한 뒤 한다.
- 한국어 템플릿을 쓸 저장소를 늘리려면 위 표에 행을 추가한다.
- 호출 인자나 요청에 언어가 명시되어 있으면(예: "영어로") 그것이 우선한다.

선택한 템플릿을 읽고, 제목과 본문을 **같은 언어**로 작성한다.

## 4. 본문 작성

근거 수집:

```bash
git log --format='%h %s%n%b' origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

- 템플릿의 섹션 구조와 순서를 유지하고 `<!-- -->` 안내 주석은 지운다. 해당 없는 섹션은 "없음" / "None"으로 둔다.
- **제목:** 커밋이 하나면 그 커밋 메시지 요약. 여러 개면 전체를 아우르는 `<type>: <요약>` 한 줄 (70자 이내).
- **변경 사항:** 파일 나열이 아니라 동작 단위로 쓴다.
- **리뷰 포인트:** 리뷰어가 특히 봐야 할 설계 판단, 위험 지점, 확신이 낮은 부분을 구체적으로 적는다.
- **테스트:** 루트 `AGENTS.md`/`CLAUDE.md`에 테스트 명령이 있으면 실행하고 결과(통과 수/실패)를 적는다. 실행하지 않았으면 "미실행"이라고 사실대로 적는다. 실행하지 않은 검증을 했다고 쓰지 않는다.
- 비밀 정보(키, 토큰, `.env` 값)를 본문에 넣지 않는다.

## 5. PR 생성

본문은 스크래치(임시) 디렉터리의 파일에 쓰고 `--body-file`로 넘긴다. 셸 인용 문제를 피하기 위함이다.

```bash
gh pr create --base <base> --head <head> --title "<제목>" --body-file <본문 파일> [--draft]
```

- `--draft`는 인자로 요청받았을 때만 붙인다.
- 리뷰어·라벨·담당자는 요청받았을 때만 지정한다.
- merge, 브랜치 삭제는 하지 않는다.

## 6. 결과 보고

호출한 쪽(메인 에이전트)이 그대로 사용자에게 전달할 수 있게 짧게 보고한다.

```
PR을 생성했습니다: <URL>

제목: <제목>
브랜치: <head> -> <base> (커밋 N개)
템플릿: 한국어 (kju-lee/react-component-generator-261001)
테스트: bun run test 19개 통과
```

- 새 브랜치를 만들었거나 로컬 base가 origin보다 앞서 있으면 함께 알린다.
- PR을 만들지 못했으면 이유와 사용자가 할 다음 행동을 알린다.
