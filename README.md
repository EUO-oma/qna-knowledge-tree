# QnA Knowledge Tree

트리 기반 지식 구조 웹앱(질문/답변/법령/링크) 최소 뼈대입니다.

## 실행 전 설정
1. `src/firebase.js`에 Firebase Web 설정 입력
2. `.firebaserc`의 `YOUR_FIREBASE_PROJECT_ID` 수정
3. Firestore에 `nodes` 컬렉션 사용

## Firestore 문서 예시
```json
{
  "title": "전입신고는 누가 해야 하나?",
  "content": "기본 설명",
  "type": "question",
  "parentId": null,
  "tags": ["전입신고", "주민등록"],
  "createdAt": "timestamp"
}
```

## 배포
```bash
firebase deploy --only hosting
```
