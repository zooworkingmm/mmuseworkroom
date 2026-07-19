/*
  포트폴리오 공용 데이터 파일
  - option-a, option-b, builder 가 함께 사용합니다.
  - builder/index.html 의 '발행' 버튼으로 자동 생성된 파일입니다.
*/

const STUDIO = {
  "name": "OOO",
  "role": "INTERIOR DESIGNER",
  "desc": "IPSUM LOREM SIT CONSORTIUM",
  "address": "서울특별시 OO구 OO로 00",
  "phone": "010.0000.0000",
  "email": "INFO@SAMPLE.COM",
  "site": "WWW.SAMPLE.SITE",
  "sns": "@SAMPLE",
  "about": "공간을 사용하는 사람의 동선과 시간을 먼저 관찰합니다. 재료와 빛, 여백의 균형을 통해 오래 머물고 싶은 공간을 만듭니다. 레지던스, 상업시설, 호스피탈리티 공간을 중심으로 작업합니다."
};

const PROJECTS = [
  {
    "id": "ap-tower",
    "name": "AP TOWER",
    "type": "레지던스 · 커뮤니티 시설",
    "year": "2026",
    "location": "서울",
    "summary": "다이닝 라운지부터 컨퍼런스 룸까지, 레지던스 입주민을 위한 커뮤니티 공간을 설계했습니다.",
    "description": "원형 대리석 테이블과 곡선 천장 조명이 중심을 이루는 다이닝 라운지를 시작으로, 우드 슬랫 파티션의 엘리베이터 로비, 통유리 컨퍼런스 라운지, 루프탑 테라스까지 하나의 동선으로 이어지는 커뮤니티 시설을 계획했습니다. 차분한 톤의 마감재와 절제된 조명 계획으로 고급 레지던스에 어울리는 품격을 담았습니다.",
    "facts": {
      "client": "OOO",
      "site": "Seoul, Korea",
      "types": "Residential",
      "topics": "Residential Tower Community Facility",
      "design": "OOO",
      "period": "Design 20XX.XX ~ XX | Construction 20XX.XX ~",
      "periodCont": "20XX.XX",
      "workScope": "Interior, Furniture",
      "area": "00,000 m²"
    },
    "images": [
      {
        "src": "../assets/images/ap-tower/04.jpg",
        "caption": "엘베홀부터 어두운 느낌이 들도록 디자인 했다"
      },
      {
        "src": "../assets/images/ap-tower/01.jpg",
        "caption": "",
        "captionHidden": false,
        "cols": 1,
        "body": ""
      },
      {
        "src": "../assets/images/ap-tower/02.jpg",
        "caption": "엘리베이터 로비",
        "cols": 1
      },
      {
        "src": "../assets/images/ap-tower/03.jpg",
        "caption": "컨퍼런스 라운지"
      }
    ]
  },
  {
    "id": "centropolis",
    "name": "CENTROPOLIS",
    "type": "복합 상업시설 · 웰니스센터",
    "year": "2026",
    "location": "서울",
    "summary": "숲을 담은 미디어 파사드부터 웰니스 센터까지, 복합 상업시설의 공용 공간을 디자인했습니다.",
    "description": "몰 입구의 미디어 파사드와 숲을 형상화한 조명 연출로 시작되는 동선은 라운지를 지나 웰니스 센터로 이어집니다. 짙은 톤의 마감과 간접조명을 활용해 상업시설의 활력과 휴식 공간의 안정감을 함께 담아낸 프로젝트입니다.",
    "facts": {
      "client": "OOO",
      "site": "Seoul, Korea",
      "types": "Commercial",
      "topics": "Mixed-use Retail & Wellness Facility",
      "design": "OOO",
      "period": "Design 20XX.XX ~ XX | Construction 20XX.XX ~",
      "periodCont": "20XX.XX",
      "workScope": "Interior, Furniture, Signage",
      "area": "00,000 m²"
    },
    "images": [
      {
        "src": "../assets/images/centropolis/01.jpg",
        "caption": "몰 입구 미디어 파사드"
      },
      {
        "src": "../assets/images/centropolis/02.jpg",
        "caption": "포레스트 미디어 월"
      },
      {
        "src": "../assets/images/centropolis/03.jpg",
        "caption": "라운지"
      },
      {
        "src": "../assets/images/centropolis/04.jpg",
        "caption": "웰니스 센터"
      },
      {
        "src": "../assets/images/centropolis/05.jpg",
        "caption": "웰니스 센터 · 러닝존"
      },
      {
        "src": "../assets/images/centropolis/06.jpg",
        "caption": "웰니스 센터 · 웨이트존"
      }
    ]
  },
  {
    "id": "sagewood",
    "name": "SAGEWOOD",
    "type": "호스피탈리티 · 리조트",
    "year": "2026",
    "location": "여수",
    "summary": "여수 경도의 자연을 마주한 리조트, 로비부터 스파까지 전 공간을 디자인했습니다.",
    "description": "",
    "facts": {
      "client": "OOO",
      "site": "Yeosu, Korea",
      "types": "Hospitality",
      "topics": "Resort Hotel",
      "design": "OOO",
      "period": "Design 20XX.XX ~ XX | Construction 20XX.XX ~",
      "periodCont": "20XX.XX",
      "workScope": "Interior, F&B, Spa",
      "area": "00,000 m²"
    },
    "images": [
      {
        "src": "../assets/images/sagewood/01.jpg",
        "caption": "로비 리셉션"
      },
      {
        "src": "../assets/images/sagewood/02.jpg",
        "caption": "로비 라운지"
      },
      {
        "src": "../assets/images/sagewood/03.jpg",
        "caption": "테라스"
      },
      {
        "src": "../assets/images/sagewood/04.jpg",
        "caption": "레스토랑"
      },
      {
        "src": "../assets/images/sagewood/05.jpg",
        "caption": "사우나 라운지"
      },
      {
        "src": "../assets/images/sagewood/06.jpg",
        "caption": "사우나 파우더룸"
      },
      {
        "src": "../assets/images/sagewood/07.jpg",
        "caption": "화장실"
      },
      {
        "src": "../assets/images/sagewood/08.jpg",
        "caption": "스파 풀"
      }
    ]
  }
];
