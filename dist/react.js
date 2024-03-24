// src/components/WalletConnectReact.tsx
import React3, {useMemo} from "react";
import {useEffect as useEffect2, useState as useState2} from "react";

// src/components/WalletSelectModal.tsx
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";

// src/assets/index.ts
var unisatLogo = `data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjEwMHB4IiBoZWlnaHQ9IjEwMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iOTEuODc1NTY2NyUiIHkxPSIyOS43Mjg4NjIyJSIgeDI9IjUuNTkzNTkzODUlIiB5Mj0iNjcuNzM4NzI0OCUiIGlkPSJsaW5lYXJHcmFkaWVudC1leXZkOXN5Z2Z5LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMjAxQzFCIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM3NzM5MEQiIG9mZnNldD0iMzYlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNFQTgxMDEiIG9mZnNldD0iNjclIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNEI4NTIiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIxMC41MTQwNjI0JSIgeTE9IjYyLjg4MzE2ODglIiB4Mj0iMTEwLjc4ODYyJSIgeTI9IjM3LjMyMTc0MDIlIiBpZD0ibGluZWFyR3JhZGllbnQtZXl2ZDlzeWdmeS0yIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzFGMUQxQyIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNzczOTBEIiBvZmZzZXQ9IjM3JSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRUE4MTAxIiBvZmZzZXQ9IjY3JSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjRGQjUyIiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxyYWRpYWxHcmFkaWVudCBjeD0iNTAlIiBjeT0iNTAuMDQ1MDk4OCUiIGZ4PSI1MCUiIGZ5PSI1MC4wNDUwOTg4JSIgcj0iNTAuODMyODIzNiUiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC41MDAwMDAsMC41MDA0NTEpLHNjYWxlKDAuOTgzNjEyLDEuMDAwMDAwKSx0cmFuc2xhdGUoLTAuNTAwMDAwLC0wLjUwMDQ1MSkiIGlkPSJyYWRpYWxHcmFkaWVudC1leXZkOXN5Z2Z5LTMiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjRCODUyIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNFQTgxMDEiIG9mZnNldD0iMzMlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM3NzM5MEQiIG9mZnNldD0iNjQlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyMTFDMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNS4wMDAwMDAsIDYuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIiBpZD0iUGF0aCI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDkuMzcxMDQwNiw3LjkwMTkzODMzIEw2Ny42OTU5OTYsMjUuNzU0MjQ5NyBDNjkuMjU1ODc2MiwyNy4yNzA2MjQ1IDcwLjAyMzYwMTgsMjguODA0OTc3OSA3MCwzMC4zNTExMzQgQzY5Ljk3NTI5MywzMS44OTcyOTAxIDY5LjMwNDE4NSwzMy4zMDY2MTcgNjcuOTkyMjk5MSwzNC41ODUxNTMzIEM2Ni42MTk4OSwzNS45MjMyNTIyIDY1LjEzODY0ODksMzYuNjAxMjIyMyA2My41NTQ2MTQzLDM2LjYzMDg2NjMgQzYxLjk3MDU3OTcsMzYuNjU0NzQ2MiA2MC4zOTg2MjIzLDM1LjkwNTQxMDkgNTguODM4NzQyMSwzNC4zODkwMzYxIEw0MC4wOTY3MTE2LDE2LjEzMjI4OTUgQzM3Ljk2ODUxNjgsMTQuMDU2OTMyNCAzNS45MTI5MjI1LDEyLjU4ODAxNTUgMzMuOTM1OTY3MiwxMS43MjU3MzA5IEMzMS45NTg4NzQ2LDEwLjg2MzQ0NjIgMjkuODc5MTI1OSwxMC43MjY2NzE5IDI3LjcwMjYyMjMsMTEuMzIxMzUwNSBDMjUuNTIwMDgwMSwxMS45MTAwODY2IDIzLjE4MDM5NywxMy40MjY1MTYzIDIwLjY3MTM1ODcsMTUuODY0NjY5NyBDMTcuMjEzMTYyMiwxOS4yMzY1NDE2IDE1LjU2MjU2NTgsMjIuNDAwMjE5MSAxNS43MzE5MjExLDI1LjM1NTgzOTMgQzE1LjkwMTEzOTEsMjguMzExMzIyMyAxNy42MTgxNjAyLDMxLjM3OTg5MTkgMjAuODc2OTQ1NiwzNC41NDk2MDc5IEwzOS43NzAyMTU1LDUyLjk2MDg4NzggQzQxLjM0ODIxMTUsNTQuNDk1MTAzOSA0Mi4xMjE5NzU4LDU2LjAyOTMyMDEgNDIuMDk3ODIxNCw1Ny41NTE3MzM1IEM0Mi4wNzM2NjcsNTkuMDgwMDQ4MyA0MS4zOTY1MjAzLDYwLjQ4OTUxMjQgNDAuMDYwMzQyOCw2MS43OTE3OTE0IEMzOC43MzAzNDExLDYzLjA4ODE2OTEgMzcuMjYxMTc3Miw2My43NjYxMzkxIDM1LjY2NTA2NTQsNjMuODE5NjYzMSBDMzQuMDY4OTUzNiw2My44NzMxODcxIDMyLjQ3ODg4MDQsNjMuMTI5ODkwMyAzMC45MDY5MjMsNjEuNTk1NTM2OSBMMTIuNTgxOTY3Nyw0My43NDMyMzkzIEM5LjYwMTM2OTYxLDQwLjg0MTI4MDIgNy40NDkwMzQxMywzOC4wOTM4NTQ0IDYuMTI1MDAyNDUsMzUuNTAwOTYxOSBDNC44MDA5NTcwNCwzMi45MDgyMDY2IDQuMzA1MjAxNywyOS45NzY0NjYzIDQuNjQ5ODEzNjIsMjYuNzA1NzQwOSBDNC45NTgxNTI3OCwyMy45MDQ3OTEyIDUuODcxMDY1NTksMjEuMTkzMDQ4IDcuMzk0NjMxODMsMTguNTY0NjEwMSBDOC45MTIxMzIwMywxNS45MzYwMzUgMTEuMDg4NjQ5NCwxMy4yNDgxMTY4IDEzLjkxMjEwNjYsMTAuNDk0NzQ4NSBDMTcuMjczNTQ4Miw3LjIxODA2Njg3IDIwLjQ4Mzg4NzYsNC43MDg1MjA3NSAyMy41NDMxMjQ3LDIuOTYwMTUzOSBDMjYuNTk2MzIzMywxLjIxMTc5OTQgMjkuNTUyNjI5NywwLjI0MjQ3MDk2MyAzMi40MDYyOCwwLjA0MDI4MDI0MjIgQzM1LjI2NTk2ODgsLTAuMTYxOTEwNzUzIDM4LjA4MzM4NzUsMC4zOTcwODc5NDUgNDAuODcwNDc1OSwxLjcxNzI3Mjc3IEM0My42NTc3MDE1LDMuMDM3NDYxNyA0Ni40ODcxOTc0LDUuMDk1MDU5NzggNDkuMzY1MDAyLDcuOTAxOTM4MzMgTDQ5LjM3MTA0MDYsNy45MDE5MzgzMyBaIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LWV5dmQ5c3lnZnktMSkiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMC42MjI5MTI2LDc5LjkzNTQ1MTUgTDIuMzA0MDIzMzYsNjIuMDgzMTUzOSBDMC43NDQxOTM5NTIsNjAuNTYwNzQwNCAtMC4wMjM2Mjk1NTQxLDU5LjAzMjQyNTcgMi4wNDU4MDg0OWUtMTUsNTcuNDg2MjY5NiBDMC4wMjQ3MzcyOTkzLDU1Ljk0MDExMzUgMC42OTU4Mjc1MSw1NC41MzA3ODY2IDIuMDA3Nzc1MTMsNTMuMjUyMTEzIEMzLjM4MDE4NDI0LDUxLjkxNDE1MTQgNC44NjE0MjUzOCw1MS4yMzYxODEzIDYuNDQ1NDMyNTIsNTEuMjA2NCBDOC4wMjk0NTMzOSw1MS4xODI2NTczIDkuNjAxMzY5NjEsNTEuOTI1OTU0MSAxMS4xNjEyMDg2LDUzLjQ0ODM2NzUgTDI5Ljg5NzI0MTcsNzEuNzA1MTE0MSBDMzIuMDMxNDc1MSw3My43ODA0NzExIDM0LjA4MTAzMDgsNzUuMjQ5MzYwNiAzNi4wNTc5ODYxLDc2LjExMTY0NTMgQzM4LjAzNTA3ODcsNzYuOTczOTI5OSA0MC4xMTQ4Mjc0LDc3LjEwNDcyMDUgNDIuMjk3MzY5Niw3Ni41MTU5NTcgQzQ0LjQ3OTkxMTgsNzUuOTI3MzMwNyA0Ni44MTk1OTQ5LDc0LjQxMDgxODYgNDkuMzI4NjMzMiw3MS45NjY2OTUzIEM1Mi43ODY5NjY5LDY4LjU5NDgyMzMgNTQuNDM3NDI2MSw2NS40MzExNDU5IDU0LjI2ODIwODEsNjIuNDc1NjYyOSBDNTQuMDk4ODUyOCw1OS41MjAwNDI2IDUyLjM4MTgzMTcsNTYuNDUxNDczMSA0OS4xMjMxODM2LDUzLjI3NTk5MjkgTDM5LjA1NjgzNzMsNDMuNTUyODg2MSBDMzcuNDc4ODQxMyw0Mi4wMTg2NyAzNi43MDQ5Mzk4LDQwLjQ4NDMxNjYgMzYuNzI5MDk0MiwzOC45NjIwNDA0IEMzNi43NTMyNDg2LDM3LjQzMzcyNTcgMzcuNDMwMzk1MiwzNi4wMjQyNjE1IDM4Ljc2NjU3MjcsMzQuNzIxOTgyNSBDNDAuMDk2NzExNiwzMy40MjU0Njc2IDQxLjU2NTg3NTYsMzIuNzQ3NjM0OCA0My4xNjE4NTAxLDMyLjY5NDExMDggQzQ0Ljc1Nzk2MTksMzIuNjQwNTg2OSA0Ni4zNDgwMzUxLDMzLjM4Mzg4MzYgNDcuOTE5OTkyNSwzNC45MTgyMzcgTDU3LjQxMTk4NTYsNDQuMDgyMjI0MyBDNjAuMzkyNTgzNyw0Ni45ODQxODM0IDYyLjU0NDkzMjksNDkuNzMxNjA5MiA2My44NjkwMzMyLDUyLjMyNDUwMTcgQzY1LjE5Mjk5NjMsNTQuOTE3MjU3IDY1LjY4ODcxMDQsNTcuODQ4OTk3MyA2NS4zNDQwOTg1LDYxLjExOTcyMjcgQzY1LjAzNTg1NTQsNjMuOTIwNjcyNCA2NC4xMjI5Mjg5LDY2LjYzMjQxNTYgNjIuNTk5MjgwMyw2OS4yNjA5OTA3IEM2MS4wODE4MDc1LDcxLjg4OTQyODYgNTguOTA1MzAzOSw3NC41Nzc0MjkxIDU2LjA4MTg0NjcsNzcuMzMwNzU2MyBDNTIuNzIwNDA1MSw4MC42MDczODMgNDkuNTEwMDY1Nyw4My4xMTY5NzAzIDQ2LjQ1MDgyODYsODQuODY1MjgyMiBDNDMuMzkxNTkxNCw4Ni42MTM3MzE0IDQwLjQzNTI4NSw4Ny41ODg5NjU0IDM3LjU3NTU5NjEsODcuNzkxMTIxMiBDMzQuNzE1OTA3Myw4Ny45OTM0MTQzIDMxLjg5ODQ4ODYsODcuNDM0Mjk0OSAyOS4xMTE0MDAyLDg2LjExNDE3NDUgQzI2LjMyNDE3NDUsODQuNzkzOTE3IDIzLjQ5NDY3ODcsODIuNzM2NDAxMiAyMC42MTY4NzQsNzkuOTI5NTUwMSBMMjAuNjIyOTEyNiw3OS45MzU0NTE1IFoiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtZXl2ZDlzeWdmeS0yKSI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTMyLjA0OTU5MDksMzMuODcxNjM3OCBDMzUuNzY1OTM3NSwzMy44NzE2Mzc4IDM4Ljc3ODY0OTksMzAuOTA4MzMyMSAzOC43Nzg2NDk5LDI3LjI1Mjc4MzIgQzM4Ljc3ODY0OTksMjMuNTk3MzcxNSAzNS43NjU5Mzc1LDIwLjYzNDA2NTggMzIuMDQ5NTkwOSwyMC42MzQwNjU4IEMyOC4zMzMyNDQyLDIwLjYzNDA2NTggMjUuMzIwNTMxOCwyMy41OTczNzE1IDI1LjMyMDUzMTgsMjcuMjUyNzgzMiBDMjUuMzIwNTMxOCwzMC45MDgzMzIxIDI4LjMzMzI0NDIsMzMuODcxNjM3OCAzMi4wNDk1OTA5LDMzLjg3MTYzNzggWiIgZmlsbD0idXJsKCNyYWRpYWxHcmFkaWVudC1leXZkOXN5Z2Z5LTMpIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjwvcmVjdD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==`;
var okxLogo = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjUwMCAyNTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNTAwIDI1MDA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8ZyBpZD0iTGF5ZXJfeDAwMjBfMSI+Cgk8ZyBpZD0iXzIxODczODEzMjM4NTYiPgoJCTxyZWN0IHk9IjAiIGNsYXNzPSJzdDAiIHdpZHRoPSIyNTAwIiBoZWlnaHQ9IjI1MDAiPjwvcmVjdD4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTE0NjMsMTAxNWgtNDA0Yy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxdi00MDQgICAgIEMxNDk0LDEwMjksMTQ4MCwxMDE1LDE0NjMsMTAxNXoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTk5Niw1NDlINTkyYy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxVjU4MEMxMDI3LDU2MywxMDEzLDU0OSw5OTYsNTQ5eiI+PC9wYXRoPgoJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTkzMCw1NDloLTQwNGMtMTcsMC0zMSwxNC0zMSwzMXY0MDRjMCwxNywxNCwzMSwzMSwzMWg0MDRjMTcsMCwzMS0xNCwzMS0zMVY1ODAgICAgIEMxOTYxLDU2MywxOTQ3LDU0OSwxOTMwLDU0OXoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTk5NiwxNDgySDU5MmMtMTcsMC0zMSwxNC0zMSwzMXY0MDRjMCwxNywxNCwzMSwzMSwzMWg0MDRjMTcsMCwzMS0xNCwzMS0zMXYtNDA0ICAgICBDMTAyNywxNDk2LDEwMTMsMTQ4Miw5OTYsMTQ4MnoiPjwvcGF0aD4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTE5MzAsMTQ4MmgtNDA0Yy0xNywwLTMxLDE0LTMxLDMxdjQwNGMwLDE3LDE0LDMxLDMxLDMxaDQwNGMxNywwLDMxLTE0LDMxLTMxdi00MDQgICAgIEMxOTYxLDE0OTYsMTk0NywxNDgyLDE5MzAsMTQ4MnoiPjwvcGF0aD4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==`;
var closeIcon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEzLjQ2IDEyTDE5IDE3LjU0VjE5aC0xLjQ2TDEyIDEzLjQ2TDYuNDYgMTlINXYtMS40NkwxMC41NCAxMkw1IDYuNDZWNWgxLjQ2TDEyIDEwLjU0TDE3LjU0IDVIMTl2MS40NkwxMy40NiAxMloiLz48L3N2Zz4=`;
var loadingIcon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMzNDYxYmMiIGQ9Ik0xMiA0VjJBMTAgMTAgMCAwIDAgMiAxMmgyYTggOCAwIDAgMSA4LThaIi8+PC9zdmc+`;

// src/components/WalletSelectModal.tsx
var WalletSelectModal = ({
  visible,
  title = "Select Wallet",
  theme = "light",
  wallets = [],
  onClick,
  onClose
}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const clickHandler = async (id, installed) => {
    if (loading || !installed)
      return;
    setLoading(true);
    try {
      await onClick?.(id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  const modalContent = visible ? React.createElement("div", {
    className: "fixed top-0 left-0 w-screen h-screen z-[9999]"
  }, React.createElement("div", {
    className: `bg-black ${theme === "dark" ? "bg-opacity-70" : "bg-opacity-30"}  w-full h-full`
  }), React.createElement("div", {
    className: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 max-w-[90%] min-h-30 max-h-[full] rounded-xl  overflow-hidden ${theme === "dark" ? "text-[#ecedee] bg-[#18181b]" : "bg-white text-black"}`
  }, React.createElement("div", {
    className: `p-4  relative ${theme === "dark" ? "border-b border-gray-600" : "border-b border-gray-200"}`
  }, React.createElement("h2", {
    className: "text-xl font-bold text-center"
  }, title), React.createElement("button", {
    onClick: () => onClose?.(),
    className: "absolute top-1/2 -translate-y-1/2 right-4"
  }, React.createElement("img", {
    src: closeIcon,
    alt: "close",
    className: `w-6 h-6 ${theme === "dark" ? "invert" : ""}`
  }))), React.createElement("div", {
    className: "p-4 flex flex-col gap-2"
  }, wallets.map((wallet) => React.createElement("div", {
    key: wallet.id,
    onClick: () => clickHandler?.(wallet.id, wallet.installed),
    className: `h-12 cursor-pointer flex items-center justify-between p-2 gap-2 rounded-lg relative overflow-hidden ${theme === "dark" ? "bg-[#2d2d2d] text-[#ecedee]" : "bg-gray-100 text-black"}`
  }, loading && React.createElement("div", {
    className: "absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center"
  }, React.createElement("img", {
    src: loadingIcon,
    alt: "loading",
    className: "w-6 h-6 animate-spin"
  })), React.createElement("div", {
    className: "flex items-center flex-1"
  }, React.createElement("img", {
    src: wallet.logo,
    alt: wallet.name,
    className: "w-8 h-8 mr-2"
  }), React.createElement("span", {
    className: "flex-1"
  }, wallet.name)), React.createElement("div", {
    className: "text-xs text-orange-600"
  }, !wallet.installed && "Not Installed")))))) : null;
  if (isBrowser) {
    return ReactDOM.createPortal(modalContent, document.body);
  } else {
    return null;
  }
};

// src/utils/index.ts
var hideStr = (str, num = 10, placeholder = "*****") => {
  if (typeof str === "string" && str) {
    return `${str?.substring(0, num)}${placeholder}${str?.substring(str?.length - num)}`;
  }
  return "";
};

// src/components/ExitIcon.tsx
import React2 from "react";
function ExitIcon(props) {
  return React2.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24",
    ...props
  }, React2.createElement("path", {
    fill: "currentColor",
    d: "M13.34 8.17c-.93 0-1.69-.77-1.69-1.7a1.69 1.69 0 0 1 1.69-1.69c.94 0 1.7.76 1.7 1.69c0 .93-.76 1.7-1.7 1.7M10.3 19.93l-5.93-1.18l.34-1.7l4.15.85l1.35-6.86l-1.52.6v2.86H7v-3.96l4.4-1.87l.67-.08c.6 0 1.1.34 1.43.85l.86 1.35c.68 1.21 2.03 2.03 3.64 2.03v1.68c-1.86 0-3.56-.83-4.66-2.1l-.5 2.54l1.77 1.69V23h-1.69v-5.1l-1.78-1.69l-.84 3.72M21 23h-2V3H6v13.11l-2-.42V1h17v22M6 23H4v-3.22l2 .42V23Z"
  }));
}

// src/hooks/react.ts
import {create} from "zustand";
import {devtools} from "zustand/middleware";

// src/connectors/base.ts
class BtcConnector {
  ready = false;
  connected = false;
  address = "";
  publicKey;
  network;
  constructor(network) {
    this.network = network;
  }
  disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
  }
  getAccount() {
    return this.address;
  }
  isAuthorized() {
    const address = this.getAccount();
    return !!address;
  }
  async getNetwork() {
    if (!this.network) {
      throw new Error("Something went wrong while connecting");
    }
    return this.network;
  }
  async getPublicKey() {
    if (!this.publicKey) {
      throw new Error("Something went wrong while connecting");
    }
    return this.publicKey;
  }
}

// src/connectors/unisat.ts
var getUnisatNetwork = (network) => {
  switch (network) {
    case "testnet":
      return "testnet";
    default:
      return "livenet";
  }
};

class UnisatConnector extends BtcConnector {
  id = "unisat";
  name = "Unisat";
  logo = unisatLogo;
  homepage = "https://unisat.io";
  banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  unisat;
  constructor(network) {
    super(network);
    this.unisat = window.unisat;
  }
  on(event, handler) {
    this.unisat.on(event, handler);
  }
  removeListener(event, handler) {
    this.unisat.removeListener(event, handler);
  }
  async connect() {
    this.connected = false;
    try {
      if (!this.unisat) {
        throw new Error("Unisat not installed");
      }
      await this.getCurrentInfo();
    } catch (error) {
      throw error;
    }
    return this.connected;
  }
  async getCurrentInfo() {
    const accounts = await this.unisat.getAccounts();
    if (accounts.length) {
      this.address = accounts[0];
      const [publicKey, network, banance] = await Promise.all([
        this.unisat.getPublicKey(),
        this.unisat.getNetwork(),
        this.unisat.getBalance()
      ]);
      this.publicKey = publicKey;
      this.network = network;
      this.banance = banance;
      this.connected = true;
    }
  }
  async disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }
  async getAccounts() {
    return this.unisat.getAccounts();
  }
  async sendToAddress(toAddress, amount) {
    return this.unisat?.sendBitcoin(toAddress, amount);
  }
  async switchNetwork(network) {
    await this.unisat.switchNetwork(getUnisatNetwork(network));
  }
  async getPublicKey() {
    return this.unisat.getPublicKey();
  }
  async getBalance() {
    return this.unisat.getBalance();
  }
  async signPsbt(psbtHex, options) {
    return this.unisat.signPsbt(psbtHex, options);
  }
  async signMessage(message) {
    return this.unisat.signMessage(message);
  }
  async signPsbts(psbtHexs, options) {
    return this.unisat.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    return this.unisat.pushTx({ rawtx: rawTx });
  }
  async pushPsbt(psbtHex) {
    return this.unisat.pushPsbt(psbtHex);
  }
}
// src/connectors/okx.ts
class OkxConnector extends BtcConnector {
  id = "okx";
  name = "OKX";
  logo = okxLogo;
  homepage = "https://www.okx.com/web3/build/docs/sdks/chains/bitcoin/provider";
  banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  okxwallet;
  constructor(network) {
    super(network);
    this.okxwallet = network === "testnet" ? window.okxwallet.bitcoinTestnet : window.okxwallet.bitcoin;
  }
  on(event, handler) {
    if (this.network === "livenet") {
      this.okxwallet.on(event, handler);
    }
  }
  async connect() {
    this.connected = false;
    try {
      if (!this.okxwallet) {
        throw new Error("OkxWallet not installed");
      }
      const res = await this.okxwallet.connect();
      this.connected = true;
      this.address = res.address;
      this.publicKey = res.publicKey;
      await this.switchNetwork("livenet");
      await this.getCurrentInfo();
    } catch (error) {
      throw error;
    }
    return this.connected;
  }
  async getCurrentInfo() {
    if (this.network === "livenet") {
      const accounts = await this.okxwallet.getAccounts();
      if (accounts.length) {
        this.address = accounts[0];
        const [publicKey, network, banance] = await Promise.all([
          this.okxwallet.getPublicKey(),
          this.okxwallet.getNetwork(),
          this.okxwallet.getBalance()
        ]);
        this.publicKey = publicKey;
        this.network = network;
        this.banance = banance;
        this.connected = true;
      }
    }
  }
  async disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }
  async getAccounts() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getAccounts();
  }
  async getNetwork() {
    return this.network;
  }
  async getPublicKey() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getPublicKey();
  }
  async getBalance() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getBalance();
  }
  async sendToAddress(toAddress, amount) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet?.sendBitcoin(toAddress, amount);
  }
  async switchNetwork(network) {
    this.network = network;
    this.okxwallet = network === "testnet" ? window.okxwallet.bitcoinTestnet : window.okxwallet.bitcoin;
  }
  async signPsbt(psbtHex, options) {
    return this.okxwallet.signPsbt(psbtHex, options);
  }
  async signMessage(message) {
    return this.okxwallet.signMessage(message);
  }
  async signPsbts(psbtHexs, options) {
    return this.okxwallet.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.pushTx(rawTx);
  }
  async pushPsbt(psbtHex) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.pushPsbt(psbtHex);
  }
}
// src/connect.ts
class BtcWalletConnect {
  local_storage_key = "_btc_connector_id";
  local_disconnect_key = "_btc_disconnect_status";
  connectorId = "unisat";
  localConnectorId;
  disConnectStatus = false;
  connected = false;
  address;
  publicKey;
  network;
  balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  connectors;
  connector;
  constructor({
    network = "livenet",
    defaultConnectorId = "unisat"
  }) {
    this.network = network;
    this.connectors = [
      {
        id: "unisat",
        instance: new UnisatConnector(this.network),
        installed: !!window.unisat
      },
      {
        id: "okx",
        instance: new OkxConnector(this.network),
        installed: !!window.okxwallet
      }
    ];
    this.localConnectorId = localStorage.getItem(this.local_storage_key) || undefined;
    this.disConnectStatus = localStorage.getItem(this.local_disconnect_key) == "1";
    this.connectorId = defaultConnectorId;
    this.connector = this.connectors.find((c) => c.id === defaultConnectorId && c.installed)?.instance;
  }
  switchConnector(id) {
    const _c = this.connectors.find((c) => c.id === id && c.installed)?.instance;
    if (!_c) {
      throw new Error("Connector not found");
    }
    this.connectorId = id;
    this.connector = _c;
    return _c;
  }
  async connect() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    this.connected = await this.connector.connect();
    if (this.connected) {
      this.address = this.connector.address;
      this.publicKey = this.connector.publicKey;
      this.balance = this.connector.banance;
      this.network = this.connector.network;
    }
    localStorage.setItem(this.local_storage_key, this.connectorId);
    localStorage.removeItem(this.local_disconnect_key);
    return this.connected;
  }
  async getCurrentInfo() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    try {
      await this.connector.getCurrentInfo();
      this.address = this.connector.address;
      this.publicKey = this.connector.publicKey;
      this.balance = this.connector.banance;
      this.connected = this.connector.connected;
    } catch (error) {
      throw error;
    }
  }
  async check() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (this.disConnectStatus) {
      return false;
    }
    this.connectorId = this.localConnectorId || this.connectorId;
    const _c = this.connectors.find((c) => c.id === this.connectorId && c.installed)?.instance;
    if (!_c) {
      throw new Error("Connector not found");
    }
    this.connector = _c;
    try {
      await this.getCurrentInfo();
    } catch (error) {
      console.error(error);
    }
  }
  async disconnect() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    await this.connector.disconnect();
    this.connected = false;
    this.address = undefined;
    this.publicKey = undefined;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
    localStorage.setItem(this.local_disconnect_key, "1");
  }
  async getAccounts() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.getAccounts();
  }
  async getNetwork() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.network;
  }
  async switchNetwork(network) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    await this.connector.switchNetwork(network);
    this.network = network;
    await this.getCurrentInfo();
  }
  async sendToAddress(toAddress, amount) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (amount <= 0) {
      throw new Error("Invalid amount");
    }
    return this.connector.sendToAddress(toAddress, amount);
  }
  async signMessage(message, type) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signMessage(message);
  }
  async signPsbt(psbtHex, options) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signPsbt(psbtHex, options);
  }
  async signPsbts(psbtHexs, options) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.pushTx(rawTx);
  }
  async pushPsbt(psbtHex) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.pushPsbt(psbtHex);
  }
  on = (event, handler) => {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.on(event, handler);
    } else {
      this.connector.on(event, handler);
    }
  };
  removeListener = (event, handler) => {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.removeListener(event, handler);
    }
  };
}
var connect_default = BtcWalletConnect;

// src/hooks/react.ts
var defaultInitState = {
  initStatus: false,
  balance: { confirmed: 0, unconfirmed: 0, total: 0 },
  connectors: [],
  publicKey: "",
  address: "",
  connected: false,
  network: "livenet"
};
var useReactWalletStore = create()(devtools((set, get) => ({
  ...defaultInitState,
  init: (config = {}) => {
    try {
      const { network = "livenet", defaultConnectorId = "unisat" } = config;
      const btcWallet = new connect_default(config);
      window.btcWallet = btcWallet;
      set(() => ({
        btcWallet,
        network,
        connectorId: defaultConnectorId,
        connector: btcWallet.connector,
        localConnectorId: btcWallet.localConnectorId,
        connectors: btcWallet.connectors.map((con) => ({
          id: con.id,
          name: con.instance.name,
          logo: con.instance.logo,
          connector: con.instance,
          installed: con.installed
        })),
        initStatus: true
      }));
    } catch (error) {
      console.error("Error initializing Wallet", error);
      set(() => ({ initStatus: false }));
      throw error;
    }
  },
  switchConnector(id) {
    const btcWallet = get().btcWallet;
    if (!btcWallet) {
      throw new Error("Wallet not initialized");
    }
    btcWallet.switchConnector(id);
    set(() => ({
      connectorId: id,
      connector: btcWallet.connector,
      localConnectorId: btcWallet.localConnectorId
    }));
  },
  check: async () => {
    try {
      const btcWallet = get().btcWallet;
      if (!btcWallet) {
        throw new Error("Wallet not initialized");
      }
      await btcWallet.check();
      const address = btcWallet.address;
      const publicKey = btcWallet.publicKey;
      const balance = btcWallet.balance;
      const connected = btcWallet.connected;
      const localConnectorId = btcWallet.localConnectorId;
      set((state) => ({
        publicKey,
        address,
        balance,
        connected,
        localConnectorId
      }));
    } catch (error) {
      console.error("Error checking Wallet", error);
      throw error;
    }
  },
  connect: async () => {
    try {
      const btcWallet = get().btcWallet;
      if (!btcWallet) {
        throw new Error("Wallet not initialized");
      }
      await btcWallet.connect();
      const address = btcWallet.address;
      const publicKey = btcWallet.publicKey;
      const balance = btcWallet.balance;
      const connected = btcWallet.connected;
      const network = btcWallet.network;
      const localConnectorId = btcWallet.localConnectorId;
      set((state) => ({
        publicKey,
        address,
        balance,
        connected,
        network,
        localConnectorId
      }));
    } catch (error) {
      console.error("Error connecting Wallet", error);
      throw error;
    }
  },
  disconnect: async () => {
    const { btcWallet } = get();
    if (!btcWallet) {
      throw new Error("Wallet not initialized");
    }
    await btcWallet.disconnect();
    set((state) => ({
      balance: { confirmed: 0, unconfirmed: 0, total: 0 },
      connectorId: undefined,
      publicKey: "",
      address: "",
      initStatus: false,
      connected: false,
      network: "livenet"
    }));
  },
  switchNetwork: async () => {
    try {
      const btcWallet = get().btcWallet;
      if (!btcWallet) {
        throw new Error("Wallet not initialized");
      }
      const network = get().network === "testnet" ? "livenet" : "testnet";
      await btcWallet.switchNetwork(network);
      const address = btcWallet.address;
      const publicKey = btcWallet.publicKey;
      const balance = btcWallet.balance;
      const connected = btcWallet.connected;
      const localConnectorId = btcWallet.localConnectorId;
      set((state) => ({
        publicKey,
        address,
        balance,
        connected,
        localConnectorId,
        network
      }));
    } catch (error) {
      console.error("Error checking Wallet", error);
      throw error;
    }
  }
})));
// src/components/WalletConnectReact.tsx
var WalletConnectReact = ({
  config: { network = "livenet", defaultConnectorId = "unisat" } = {},
  theme = "dark",
  ui: { connectClass = "", disconnectClass = "" } = {},
  text: { connectText = "Connect", disconnectText = "Disconnect", modalTitle = "Select Wallet" } = {},
  onConnectSuccess,
  onConnectError,
  onDisconnectSuccess,
  onDisconnectError,
  children
}) => {
  const [visible, setVisible] = useState2(false);
  const {
    connect: connect2,
    check,
    connectors: connectors2,
    connected,
    address,
    init,
    disconnect,
    initStatus,
    btcWallet,
    switchConnector
  } = useReactWalletStore((state) => state);
  const handleConnect = () => {
    setVisible(true);
  };
  const walletSelect = async (id) => {
    switchConnector(id);
    try {
      await connect2();
      if (btcWallet) {
        onConnectSuccess?.(btcWallet);
      }
    } catch (error) {
      onConnectError?.(error);
    }
  };
  const handlerDisconnect = async () => {
    try {
      await disconnect();
      onDisconnectSuccess?.();
    } catch (error) {
      console.error(error);
      onDisconnectError?.(error);
    }
  };
  const wallets = useMemo(() => {
    return connectors2?.map((c) => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      installed: c.installed
    })) || [];
  }, [connectors2]);
  useEffect2(() => {
    init({ network, defaultConnectorId });
  }, []);
  useEffect2(() => {
    init({ network, defaultConnectorId });
  }, [network, defaultConnectorId]);
  return React3.createElement(React3.Fragment, null, !connected ? React3.createElement(React3.Fragment, null, React3.createElement("button", {
    onClick: handleConnect,
    className: `bg-clip-text text-transparent border  rounded-xl h-10 px-4 hover:border-yellow-500 ${theme === "dark" ? "bg-gradient-to-r from-pink-500 to-violet-500 border-gray-600" : "bg-gradient-to-r from-blue-500 to-green-500 border-gray-300"} ${connectClass}`
  }, connectText), React3.createElement(WalletSelectModal, {
    theme,
    title: modalTitle,
    onClose: () => setVisible(false),
    visible,
    wallets,
    onClick: walletSelect
  })) : children ? children : React3.createElement("button", {
    onClick: handlerDisconnect,
    className: `bg-clip-text text-transparent border border-gray-300 rounded-xl h-10 px-4 hover:border-yellow-500 flex justify-center items-center ${theme === "dark" ? "bg-gradient-to-r from-pink-500 to-violet-500" : "bg-gradient-to-r from-blue-500 to-green-500"} ${disconnectClass}`
  }, React3.createElement("span", {
    className: "mr-1"
  }, hideStr(address, 4, "***")), React3.createElement(ExitIcon, {
    className: `${theme === "dark" ? "text-white" : "text-black"}`
  })));
};
export {
  useReactWalletStore,
  WalletConnectReact
};
