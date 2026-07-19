/*
  포트폴리오 공용 데이터 파일
  - option-a, option-b, builder 가 함께 사용합니다.
  - builder/index.html 의 '발행' 버튼으로 자동 생성된 파일입니다.
*/

const STUDIO = {
  "name": "mmuseworkroom",
  "role": "space designer",
  "desc": "IPSUM LOREM SIT CONSORTIUM",
  "address": "@mmuseworkroom",
  "phone": "010-2848-7707",
  "email": "zooworking.mm@gmail.com",
  "site": "www.mmuseworkroom.xyz",
  "sns": "",
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
    "description": "체크인하자마자 마주치는 다이닝 라운지의 곡선 조명과 원형 대리석 테이블에서 시작해서, 엘리베이터 로비와 컨퍼런스 라운지를 지나 루프탑 테라스까지 이어지는 커뮤니티 동선을 만들었어요. 차분한 마감재와 절제된 조명으로 레지던스 특유의 여유를 담고 싶었습니다.",
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
        "caption": "노을 질 때 가장 예쁜 루프탑, 야외 다이닝과 라운지 시팅을 같이 뒀어요",
        "body": "루프탑 테라스"
      },
      {
        "src": "../assets/images/ap-tower/01.jpg",
        "caption": "8인용 원형 대리석 테이블 위로 곡선 펜던트 조명을 늘어뜨렸습니다",
        "captionHidden": false,
        "cols": 1,
        "body": "다이닝 라운지"
      },
      {
        "src": "../assets/images/ap-tower/02.jpg",
        "caption": "우드 슬랫 파티션 하나로 로비 분위기가 확 달라졌어요",
        "cols": 1,
        "body": "엘리베이터 로비"
      },
      {
        "src": "../assets/images/ap-tower/03.jpg",
        "caption": "통유리 너머 도시 전망이 그대로 회의실 배경이 되는 공간",
        "body": "컨퍼런스 라운지"
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
        "caption": "몰 입구에 서면 제일 먼저 눈에 들어오는 건 우드 루버 사이로 새어 나오는 조명이었다. CENTROPOLIS 사인 아래, 붉은 포인트 컬러가 에스컬레이터를 타고 지하로 이어지는 동선을 자연스럽게 안내한다. 밤에 보면 이 파사드 하나로 건물 전체 인상이 결정되는 느낌이었다.",
        "body": "몰 입구 미디어 파사드"
      },
      {
        "src": "../assets/images/centropolis/02.jpg",
        "caption": "숲을 형상화한 미디어 월 앞에 서서 한참을 바라봤다. 나뭇가지처럼 뻗은 조명 패턴이 천천히 움직이면서, 딱딱한 상업시설 로비에 유일하게 숨을 불어넣는 지점이었다.",
        "body": "포레스트 미디어 월"
      },
      {
        "src": "../assets/images/centropolis/03.jpg",
        "caption": "짙은 톤 마감과 낮은 조도의 간접조명이 만나는 라운지. 사람들이 잠깐 앉아 쉬어가라고 만든 자리인데, 의외로 그 절제된 분위기가 오래 머물고 싶게 만든다.",
        "body": "라운지"
      },
      {
        "src": "../assets/images/centropolis/04.jpg",
        "caption": "웰니스 센터 입구에 들어서는 순간 온도가 달라지는 느낌이었다. 짙은 마감재로 차분하게 정리해서, 운동하러 온 사람도 한 템포 늦춰 걷게 되는 공간.",
        "body": "웰니스 센터"
      },
      {
        "src": "../assets/images/centropolis/05.jpg",
        "caption": "러닝 머신이 나란히 놓인 러닝존. 통유리 밖 풍경을 보며 달릴 수 있게 배치를 짰다 — 실제로 써본 사람들 반응이 제일 좋았던 구간이다.",
        "body": "웰니스 센터 · 러닝존"
      },
      {
        "src": "../assets/images/centropolis/06.jpg",
        "caption": "웨이트존은 철저히 기능 위주로 설계했다. 장비 동선만 남기고 나머지는 다 덜어냈더니, 오히려 그게 이 공간의 스타일이 됐다.",
        "body": "웰니스 센터 · 웨이트존"
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
