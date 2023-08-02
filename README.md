<img src="./icon.png" width="300px" height="300px" title="jangaeDB"/>
<br/>
# jangaeDB (장애DB)
디스코드 최초 장애당 인원 차단 봇
> **알림**
> 이 프로젝트에서 사용하는 '장애'는 실제 장애인을 의미하는 것이 절대로 아닙니다.
> 로블록스의 '장애당'을 의미하는 고유명사임을 알려 드립니다.

# 왜 장애당을 차단해야 하나요?

이 <a href="https://docs.google.com/document/d/1k1xYTbQ4CUO6p1TLF1QqKTiED75GJv1BldChjbwZDNQ/edit">구글 문서</a>를 읽는 것을 권장합니다.
하지만, 이 문서 조차 읽는 것이 귀찮다면, 아래의 두 사진을 보세요.

<img src="./nazi.png" title="nazi1"/>
<img src="./nazi.jpg" title="nazi2" width="50%"/><br/>
그룹 대표부터 네오 나치 성향에, 인원들도 이미 글러먹은 것을 알 수 있습니다.<br/>
굳이 네오 나치를 우리의 소중한 서버에 들어오게 할 필요가 있을까요?

# 이 봇을 어떻게 설치하나요?

0. jangaeDB를 사용하기 전, 다음과 같은 것이 필요합니다.
<ul>
<li><a href="https://nodejs.org/ko" target="_blank">Node.js</a> 18 이상 권장</li>
<li><a href="https://yarnpkg.com/getting-started/install" target="_blank">Yarn</a></li>
<li><a href="https://dev.mysql.com/downloads/" target="_blank">MySQL</a></li>

<li>프로그래밍에 대한 기초적인 지식이 있는 대가리</li>
</ul>

1. 디스코드 봇을 <a href="https://discord.com/developers/applications">생성합니다.</a>

2. 디스코드 봇을 생성했다면, 이 레포지토리를 클론하거나, 알아서 받아가세요.

3. 노드 모듈이 포함되지 않았으니, 다음과 같은 명령어를 입력해주세요.

```bash
yarn
```

4. config.json 파일을 루트 폴더에다 만들고, 내용물을 아래와 같이 해주세요.

```json
{
  "token": "(니네 봇 토큰)",
  "SQL_HOST": "(MySQL 호스트)",
  "SQL_USER": "(MySQL 유저)",
  "SQL_PW": "(MySQL 비밀번호)",
  "SQL_DB": "(MySQL 데이터베이스 이름)"
}
```

5. MySQL 데이터베이스는 알아서 생성해주세요.
