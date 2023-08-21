const mysql = require("mysql2");
const config = require("./config.json");
const fs = require("fs");

let connection = mysql.createConnection({
  host: config.SQL_HOST,
  user: config.SQL_USER,
  password: config.SQL_PW,
  database: config.SQL_DB,
});
connection.connect();
let banned = 0;

const {
  Client,
  Interaction,
  Events,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});
let data = [];
const commandCooldowns = new Set();

function isAdmin(msg) {
  return msg.member.permissionsIn(msg.channel).has("ADMINISTRATOR");
}

function readjson() {
  fs.readFile("db.json", "utf8", (err, jsonData) => {
    if (err) throw err;
    const data = JSON.parse(jsonData);
    banned = data.count;
  });
}

setInterval(dosomething, 30 * 1000);

function dosomething() {
  getdata();
  readjson();
  client.user.setPresence({
    activities: [
      {
        name: `${client.guilds.cache.size}개 서버에서 장애당 ${banned}마리 처치함 | 데이터 개수 : ${data.length}개`,
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });
}
async function getdata() {
  connection.query("SELECT * FROM jangae", function (err, results, fields) {
    if (err) {
      console.log(err);
    }
    data = [];
    for (let i = 0; i < results.length; i++) {
      data.push(results[i].discord_id);
    }
  });
}
async function ban(user, guild, msg) {
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("jangaeDB : 자동 밴")
    .setURL("https://discord.gg/4nfgsZ9ckQ")
    .setDescription(
      `너는 지옥의 화염에 의해 ${guild.name} 서버에서 추방되었다.`
    )
    .setThumbnail(
      "https://media.discordapp.net/attachments/1136111904432066610/1136111970098090034/Untitled512.png"
    )
    .addFields({
      name: "의문을 품고 싶다면?",
      value:
        "위 링크로 들어가 어둠의 문을 두드려라. EschatonDB의 문의 채널에서 답을 얻을 것이다.",
    })
    .setFooter({
      text: "JangaeDB 장애당 차단 시스템",
      iconURL:
        "https://media.discordapp.net/attachments/1136111904432066610/1136111970098090034/Untitled512.png",
    })
    .setTimestamp();
  let targetUser = user;
  if (typeof user == "string") {
    targetUser = await guild.members.fetch(user);
  }
  let reason = "jangaeDB : 자동 밴";

  targetUser
    .send({ embeds: [exampleEmbed] })
    .catch((error) => {
      msg.reply(
        targetUser.user.username +
          "에게 안내의 메시지를 전하는 것은 어둠의 의지에 저항하려는 진부한 시도였네."
      );
    })
    .then(async () => {
      try {
        await targetUser.ban({ reason });
        banned++;
        fs.readFile("db.json", "utf8", (err, jsonData) => {
          if (err) throw err;
          const data = JSON.parse(jsonData);
          data.count++;

          const updatedJsonData = JSON.stringify(data, null, 2);
          fs.writeFile("db.json", updatedJsonData, (err) => {
            if (err) throw err;
          });
        });
        if (msg) {
          msg.reply(
            targetUser.user.username +
              "은(는) 이제 어둠으로 향하는 길목에 서 있군. 그를 지옥으로 추방함으로써 어둠의 축복을 받게 되었다네."
          );
        }
      } catch (error) {
        console.log(`There was an error when banning: ${error}`);
      }
    });
}

client.on("ready", () => {
  console.log(`봇 켜짐 : ${client.user.tag}!`);

  getdata();
});

process.on("uncaughtException", (err) => {
  console.log("General error:", err.message);
  console.log(err);
});

client.on("guildMemberAdd", async (member) => {
  if (data.includes(member.user.id)) {
    if (member.guild.id != "1135788320681623562") {
      ban(member.user.id, member.guild, null);
    } else {
      let role = member.guild.roles.cache.find(
        (role) => role.id == "1135794743129952336"
      );
      if (role)
        member.guild.members.cache
          .get(member.user.id)
          .roles.add(role, "장애당 감지 : " + member.user.id);
      client.channels
        .fetch("1135788321424035842")
        .then((channel) =>
          channel.send(
            `<@${member.user.id}>님, 장애당인것으로 확인되셨습니다. 이의 제기를 하시려면, <#1135795729777037332> 에 가서 티켓을 여신 후 정중하게 문의해주세요.`
          )
        );
    }
    // console.log(typeof member);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id == "1135798027400007711") {
    if (message.content.includes("\\n")) {
      const split = message.content.split("\\n");
      const sucess = 0;
      for (let i = 0; i < split.length; i++) {
        if (!data.includes(split[i])) {
          connection.connect();
          const query = `INSERT INTO jangae () VALUES ?`;
          const values = [[split[i], message.author.id]];
          connection.query(query, [values], function (err, results, fields) {
            if (err) {
              console.log(err);
            } else {
              sucess++;
            }
          });
        } else {
        }
      }
      message.reply("성공적으로 " + sucess + "개의 데이터를 추가했습니다.");
    } else {
      if (!data.includes(message.content)) {
        connection.connect();
        const query = `INSERT INTO jangae () VALUES ?`;
        const values = [[message.content, message.author.id]];
        connection.query(query, [values], function (err, results, fields) {
          if (err) {
            console.log(err);
            message.react("🐞");
          } else {
            message.react("✅");
          }
        });
      } else {
        message.react("❌");
      }
    }
  } else if (message.channel.id == "1135798038204514335") {
    if (data.includes(message.content)) {
      connection.connect();
      const query = `DELETE FROM jangae WHERE discord_id = ?`;
      const values = [[message.content]];
      connection.query(query, [values], function (err, results, fields) {
        if (err) {
          console.log(err);
          message.react("🐞");
        } else {
          message.react("✅");
        }
      });
    } else {
      message.react("❌");
    }
  }
  // if (message.content == "!서버확인") {
  //   client.guilds.cache.forEach((guild) => {
  //     console.log(guild.name);
  //   });
  // }
  if (message.content == "!스캔") {
    const targetUser = await message.guild.members.fetch(message.author.id);
    if (
      targetUser.permissions.has(PermissionsBitField.Flags.BanMembers) ||
      message.author.id == "183299738823688192"
    ) {
      if (commandCooldowns.has(message.guildId)) {
        message.reply(
          "20초 간격으로만 가능하며, 너무 자주 시도하면 어둠의 눈에 띄게 될 것이다."
        );
      } else {
        commandCooldowns.add(message.guildId);
        setTimeout(() => {
          commandCooldowns.delete(message.guildId);
        }, 20000);
        let count = 0;
        getdata();
        const guild = message.guild;
        guild.members
          .fetch()
          .then((fetchedMembers) => {
            const keys = Array.from(fetchedMembers.keys());
            for (let i = 0; i < keys.length; i++) {
              if (data.includes(keys[i])) {
                ban(fetchedMembers.get(keys[i]), guild, message);
                count++;
              }
            }
          })
          .then(() => {
            if (count == 0) {
              message.reply(
                "스캔 완료. 이 세상에는 악마에게 항복하지 않는 이가 없군."
              );
            } else {
              message.reply(
                "암흑의 힘이 깃든 스캔 완료. 이제 " +
                  count +
                  "명의 영혼을 바치는 제령의 축복을 전할 차례다."
              );
            }
          });
      }
    } else {
      message.reply(
        "허락받지 못한 자여, 이 길은 네게 폐허와 저주만을 남길 것이다."
      );
    }
  } else if (message.content == "!데이터파일저장") {
    // // getdata를 해서 불러온 값을 .txt파일에 저장, 파일명은 오늘 날짜
    // const today = new Date();
    // const year = today.getFullYear();
    // const month = today.getMonth() + 1;
    // const date = today.getDate();
    // const filename = year + "-" + month + "-" + date + ".txt";
    // fs.writeFile(filename, data, (err) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     message.reply("데이터 저장 완료");
    //   }
    // });
  }
});

client.login(config.token);
