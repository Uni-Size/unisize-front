#!/bin/bash

# Unisize Front 배포 스크립트
# 홈서버에서 실행되는 배포 자동화 스크립트

set -e  # 에러 발생 시 스크립트 중단

echo "=========================================="
echo "Unisize Front 배포 시작"
echo "=========================================="

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}현재 브랜치: ${CURRENT_BRANCH}${NC}"

# Git pull (docker-compose.yml 업데이트용)
echo -e "\n${YELLOW}[1/6] 최신 설정 파일 가져오는 중...${NC}"
git fetch origin
git pull origin ${CURRENT_BRANCH}
echo -e "${GREEN}✓ 설정 파일 업데이트 완료${NC}"

# 환경 변수 확인
if [ -f .env.production ]; then
    echo -e "${GREEN}✓ .env.production 파일 확인됨${NC}"
else
    echo -e "${YELLOW}⚠ .env.production 파일이 없습니다${NC}"
fi

# GitHub Container Registry 로그인
echo -e "\n${YELLOW}[2/6] GitHub Container Registry 로그인 중...${NC}"
if [ -n "$GHCR_PAT" ]; then
    echo $GHCR_PAT | docker login ghcr.io -u $GITHUB_USER --password-stdin
    echo -e "${GREEN}✓ 로그인 완료${NC}"
else
    echo -e "${RED}✗ GHCR_PAT 환경변수가 설정되지 않았습니다${NC}"
    echo -e "${YELLOW}수동으로 로그인하세요: docker login ghcr.io${NC}"
fi

# 최신 Docker 이미지 pull
echo -e "\n${YELLOW}[3/6] 최신 Docker 이미지 다운로드 중...${NC}"
docker-compose pull
echo -e "${GREEN}✓ 이미지 다운로드 완료${NC}"

# 기존 컨테이너 중지
echo -e "\n${YELLOW}[4/6] 기존 컨테이너 중지 중...${NC}"
docker-compose down
echo -e "${GREEN}✓ 컨테이너 중지 완료${NC}"

# 컨테이너 시작
echo -e "\n${YELLOW}[5/6] 컨테이너 시작 중...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ 컨테이너 시작 완료${NC}"

# 헬스 체크
echo -e "\n${YELLOW}[6/6] 헬스 체크 중...${NC}"
sleep 5  # 컨테이너 시작 대기

# 컨테이너 상태 확인
if docker ps | grep -q unisize-front; then
    echo -e "${GREEN}✓ 컨테이너가 정상적으로 실행 중입니다${NC}"

    # 로그 확인
    echo -e "\n${YELLOW}최근 로그:${NC}"
    docker-compose logs --tail=20

    echo -e "\n${GREEN}=========================================="
    echo "배포 완료!"
    echo "URL: http://localhost:3000"
    echo "==========================================${NC}"
else
    echo -e "${RED}✗ 컨테이너 시작 실패${NC}"
    echo -e "${YELLOW}에러 로그:${NC}"
    docker-compose logs --tail=50
    exit 1
fi

# 오래된 Docker 이미지 정리 (선택사항)
echo -e "\n${YELLOW}오래된 이미지 정리 중...${NC}"
docker image prune -f
echo -e "${GREEN}✓ 정리 완료${NC}"

echo -e "\n${GREEN}모든 배포 프로세스가 완료되었습니다!${NC}"
