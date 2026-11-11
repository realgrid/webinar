{
  "report": {
    "name": "reportRoot",
    "type": "report",
    "paperSize": "A4",
    "paperWidth": "210mm",
    "paperHeight": "297mm",
    "marginLeft": "12mm",
    "marginRight": "12mm",
    "marginTop": "15mm",
    "marginBottom": "15mm"
  },
  "page": {
    "name": "reportPage",
    "type": "report",
    "pageHeader": {
      "name": "pageHeader",
      "height": "50px",
      "styles": {
        "border": "1px solid #000"
      },
      "items": [
        {
          "type": "text",
          "name": "",
          "text": "페이지 헤더",
          "styles": {
            "fontSize": "24px",
            "fontWeight": "bold"
          }
        }
      ]
    },
    "reportHeader": {
      "name": "reportHeader",
      "height": "50px",
      "styles": {
        "backgroundColor": "#49cc93"
      },
      "items": [
        {
          "type": "text",
          "text": "리포트 헤더",
          "styles": {
            "fontSize": "24px",
            "fontWeight": "bold",
            "_tag_": {}
          }
        }
      ]
    },
    "reportFooter": {
      "name": "reportFooter",
      "height": "50px",
      "alignToBottom": true,
      "styles": {
        "backgroundColor": "#49cc93"
      },
      "items": [
        {
          "type": "text",
          "name": "",
          "text": "리포트 푸터",
          "styles": {
            "fontSize": "20px"
          }
        }
      ]
    },
    "pageFooter": {
      "name": "pageFooter",
      "height": "59px",
      "styles": {
        "border": "1px solid #000"
      },
      "items": [
        {
          "type": "rbox",
          "name": "",
          "right": 0,
          "itemGap": 4,
          "items": [
            {
              "type": "text",
              "value": "${page}",
              "name": "",
              "text": "Text"
            },
            {
              "type": "text",
              "name": "",
              "text": "/",
              "styles": {
                "paddingLeft": "3px",
                "paddingRight": "3px",
                "_tag_": {}
              }
            },
            {
              "type": "text",
              "value": "${pages}",
              "name": "",
              "text": "Text"
            }
          ]
        },
        {
          "type": "text",
          "name": "",
          "text": "페이지 푸터",
          "styles": {
            "fontSize": "20px"
          }
        }
      ]
    },
    "body": {
      "itemGap": 4,
      "items": [
        {
          "type": "stack",
          "width": "100%",
          "height": 763,
          "name": "",
          "items": [
            {
              "type": "text",
              "width": 613,
              "height": "600px",
              "name": "",
              "left": 38,
              "top": 15,
              "wrap": true,
              "multiLine": true,
              "text": "본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\nv\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\nv\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\nv\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abcef\\본문 영역 중요한 내용 잔뜩 abcef본문 영역 중요한 내용 잔뜩 abc\n\n"
            }
          ]
        }
      ]
    },
    "backItems": [
      {
        "type": "text",
        "width": 116,
        "height": 71,
        "name": "",
        "left": 280,
        "top": 279,
        "text": "",
        "styles": {
          "fontSize": "24px",
          "backgroundColor": "red"
        }
      },
      {
        "type": "image",
        "width": 329,
        "height": 231,
        "name": "",
        "left": 351,
        "top": 661,
        "image": "노란별",
        "imageFit": "contain"
      }
    ],
    "frontItems": [
      {
        "type": "text",
        "width": 162,
        "height": 71,
        "name": "",
        "left": 506,
        "top": 805,
        "text": "프론트 아이템",
        "styles": {
          "fontSize": "24px"
        }
      },
      {
        "type": "image",
        "width": 344,
        "height": 377,
        "name": "",
        "left": 293,
        "top": 329,
        "image": "좋아요",
        "imageFit": "contain"
      }
    ]
  },
  "assets": {
    "/": [
      {
        "name": "노란별",
        "type": "img",
        "data": "/templates/asset/general/star-yellow.png"
      },
      {
        "name": "좋아요",
        "type": "img",
        "data": "/templates/asset/general/like.png"
      }
    ]
  },
  "data": {},
  "guid": "a164823b-3352-412f-ad27-5fdea27ceeaf"
}