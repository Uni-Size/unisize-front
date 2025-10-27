# GitHub 설정 가이드

Docker 이미지 기반 CI/CD를 위한 GitHub 설정 가이드입니다.

## 1. GitHub Package 권한 설정

### 1.1. Package 공개 설정

이미지가 처음 푸시된 후:

1. GitHub 저장소 페이지 접속
2. 오른쪽 사이드바 **Packages** 섹션 확인
3. `unisize-front` 패키지 클릭
4. **Package settings** (톱니바퀴 아이콘)
5. **Change visibility** > **Public** 선택 (또는 Private 유지)
6. **Manage Actions access** 에서:
   - `uni-size/unisize-front` 저장소에 **Write** 권한 부여

### 1.2. Personal Access Token (PAT) 생성

홈서버에서 이미지를 pull 받기 위한 토큰 생성:

1. GitHub 프로필 > **Settings**
2. 좌측 맨 아래 **Developer settings**
3. **Personal access tokens** > **Tokens (classic)**
4. **Generate new token (classic)**
5. 설정:
   - Note: `unisize-homeserver-ghcr`
   - Expiration: `No expiration` (또는 1년)
   - Select scopes:
     - ✅ `read:packages` (패키지 읽기)
     - ✅ `write:packages` (패키지 쓰기 - 선택사항)
6. **Generate token** 클릭
7. **생성된 토큰 복사** (한 번만 보임!)

## 2. GitHub Secrets 등록

저장소 > Settings > Secrets and variables > Actions > New repository secret

### 필요한 Secrets

| Secret 이름 | 값 | 설명 |
|------------|---|------|
| `SSH_HOST` | `192.168.0.34` | 홈서버 IP |
| `SSH_USERNAME` | `frontend` | 홈서버 계정명 |
| `SSH_KEY` | `-----BEGIN OPENSSH...` | SSH 개인키 전체 |
| `SSH_PORT` | `2022` | SSH 포트 |
| `GHCR_PAT` | `ghp_...` | 위에서 생성한 PAT |

### SSH_KEY 값 가져오기

홈서버에서:

```bash
# frontend 계정으로
cat ~/.ssh/id_ed25519
```

전체 내용 (첫 줄부터 마지막 줄까지) 복사

### GHCR_PAT 값

위 1.2단계에서 생성한 Personal Access Token

## 3. 홈서버 환경 변수 설정

홈서버에서 로그인 편의를 위한 환경 변수 설정 (선택사항):

```bash
# frontend 계정으로 로그인 후
nano ~/.bashrc

# 맨 아래 추가:
export GITHUB_USER="kiseon77"  # GitHub 사용자명
export GHCR_PAT="ghp_xxxxxxxxxxxxx"  # 위에서 생성한 PAT

# 저장 후 적용
source ~/.bashrc
```

## 4. 배포 플로우

### 자동 배포 (GitHub Actions)

```
코드 Push
  ↓
GitHub Actions 실행
  ↓
1. Lint & Type Check
  ↓
2. Docker 이미지 빌드
  ↓
3. GitHub Container Registry에 푸시
  ↓
4. 홈서버 SSH 접속
  ↓
5. 이미지 Pull
  ↓
6. 컨테이너 재시작
  ↓
배포 완료!
```

### 수동 배포 (홈서버에서)

```bash
# 홈서버에서
cd ~/unisize-front

# 환경 변수 설정 (한 번만)
export GITHUB_USER="kiseon77"
export GHCR_PAT="ghp_xxxxxxxxxxxxx"

# 배포 스크립트 실행
./deploy.sh
```

## 5. GitHub Container Registry 로그인

### 로컬/홈서버에서 수동 로그인

```bash
# PAT를 사용한 로그인
echo $GHCR_PAT | docker login ghcr.io -u kiseon77 --password-stdin

# 또는 대화형 로그인
docker login ghcr.io
Username: kiseon77
Password: [PAT 입력]
```

### 로그인 확인

```bash
# 로그인 정보 확인
cat ~/.docker/config.json

# 이미지 pull 테스트
docker pull ghcr.io/uni-size/unisize-front:latest
```

## 6. 이미지 공개 범위

### Public (공개)
- 누구나 pull 가능
- 로그인 불필요
- 무료

### Private (비공개)
- 인증 필요
- PAT 또는 GitHub 계정으로 로그인 필요
- 무료 (용량 제한 있음)

**추천**: Private으로 유지하고 PAT로 접근

## 7. 트러블슈팅

### "no basic auth credentials" 에러

```bash
# 재로그인
docker logout ghcr.io
echo $GHCR_PAT | docker login ghcr.io -u kiseon77 --password-stdin
```

### "unauthorized" 에러

1. PAT 권한 확인 (`read:packages` 필요)
2. Package visibility 확인 (Public 또는 저장소 권한)
3. GitHub Actions 권한 확인

### 이미지를 찾을 수 없음

```bash
# 이미지 경로 확인
# 올바른 형식: ghcr.io/uni-size/unisize-front:latest
#              ghcr.io/[조직또는유저명]/[저장소명]:latest

# 저장소 이름은 소문자로 자동 변환됨
# Uni-Size → uni-size
```

### GitHub Actions 빌드 실패

1. GitHub 저장소 > Actions 탭 > 실패한 워크플로우 클릭
2. 로그 확인
3. 권한 문제: Settings > Actions > General > Workflow permissions > Read and write permissions 확인

## 8. 비용

- **GitHub Container Registry**: 무료 (Public 무제한, Private 500MB)
- **GitHub Actions**: 무료 (Public 저장소 무제한, Private 2000분/월)
- **패키지 스토리지**: 무료 (500MB)

**참고**: Public 저장소는 모두 무료입니다!

## 9. 유용한 명령어

```bash
# 로컬 이미지 목록
docker images | grep unisize

# 특정 이미지 삭제
docker rmi ghcr.io/uni-size/unisize-front:latest

# 모든 dangling 이미지 삭제
docker image prune -a

# 이미지 상세 정보
docker inspect ghcr.io/uni-size/unisize-front:latest

# 이미지 히스토리
docker history ghcr.io/uni-size/unisize-front:latest
```

## 10. 참고 링크

- [GitHub Packages 문서](https://docs.github.com/en/packages)
- [GitHub Container Registry 가이드](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Login 문서](https://docs.docker.com/engine/reference/commandline/login/)
