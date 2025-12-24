# Thermal Printer Integration

Marklife Thermal Printer D100을 위한 Web Bluetooth API 기반 프린터 통합.

## 기능

- 최종 확정 시 자동으로 프린트 모달 표시
- 학생 정보와 주문 내역이 포함된 송장 출력
- Web Bluetooth API를 통한 무선 프린터 연결

## 사용 방법

1. **프린터 준비**: Marklife D100 프린터를 켜고 Bluetooth 페어링 모드로 설정
2. **최종 확정**: 측정 시트에서 "최종 확정" 버튼 클릭
3. **모달 확인**: 확정 완료 후 프린트 모달이 자동으로 표시됨
4. **프린터 연결**: "확인 및 프린트" 버튼 클릭 시 프린터 선택 창이 나타남
5. **프린트 완료**: 송장이 출력되고 자동으로 시트가 닫힘

## 출력 내용

송장에는 다음 정보가 포함됩니다:

- 학교 정보 (학교명, 입학년도)
- 학생 정보 (이름, 성별, 연락처)
- 교복 주문 내역 (동복/하복 구분, 사이즈, 수량, 맞춤정보)
- 용품 주문 내역 (품목명, 사이즈, 수량)

## 브라우저 호환성

Web Bluetooth API가 필요하므로 다음 브라우저를 사용해야 합니다:

- Chrome/Edge (Desktop & Android)
- Opera (Desktop & Android)
- Samsung Internet

**참고**: iOS Safari는 Web Bluetooth를 지원하지 않습니다.

## 문제 해결

### 프린터가 연결되지 않는 경우

1. 프린터가 켜져 있는지 확인
2. Bluetooth가 활성화되어 있는지 확인
3. 프린터가 페어링 모드인지 확인
4. 브라우저가 Web Bluetooth를 지원하는지 확인

### 출력이 제대로 안 되는 경우

1. 프린터 용지가 충분한지 확인
2. 프린터 배터리가 충분한지 확인
3. 프린터를 다시 시작해 보세요

## 기술 스택

- **Web Bluetooth API**: 무선 프린터 연결
- **ESC/POS Commands**: 열전사 프린터 제어
- **React**: UI 컴포넌트 및 상태 관리
