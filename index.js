const mysql = require("mysql2");
const config = require("./config.json");
const fs = require("fs");

let connection = mysql.createConnection({
  host: config.SQL_HOST,
  user: config.SQL_USER,
  password: config.SQL_PW,
  database: config.SQL_DB,
});
let banned = 0;
connection.connect();
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

function getBanMessage(guild) {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("jangaeDB : 자동 밴")
    .setURL("https://discord.gg/4nfgsZ9ckQ")
    .setDescription(
      `당신은 jangaeDB에 의해 ${guild.name} 서버에서 자동 밴 되었습니다.`
    )
    .setThumbnail(
      "https://media.discordapp.net/attachments/1136111904432066610/1136111970098090034/Untitled512.png"
    )
    .addFields({
      name: "장애당이 아니시라면?",
      value: "위 링크를 타고 jangaeDB 문의 채널에서 문의하세요.",
    })
    .setFooter({
      text: "JangaeDB 장애당 차단 시스템",
      iconURL:
        "https://media.discordapp.net/attachments/1136111904432066610/1136111970098090034/Untitled512.png",
    })
    .setTimestamp();
}
async function ban(userId, guild, msg) {
  const BanMessage = getBanMessage(guild);
  const targetUser = await guild.members.fetch(userId);

  targetUser.send({ embeds: [BanMessage] }).then(async () => {
    try {
      await targetUser.ban({ reason: "jangaeDB : 자동 밴" });

      banned++;

      // db.json에 벤 된 인원 수 저장함
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
        msg.reply(targetUser.user.username + "님을 밴했습니다.");
      }
    } catch (error) {
      console.log(`There was an error when banning: ${error}`);
    }
  });
}

client.on("ready", () => {
  console.log(`장애봇 온라인!`);

  getdata();
});

process.on("uncaughtException", (err) => {
  console.log("General error:", err.message);
  console.log(err);
});

client.on("guildMemberAdd", async (member) => {
  if (
    data.includes(member.user.id) &&
    member.guild.id != "1135788320681623562"
  ) {
    ban(member.user.id, member.guild, null);
  }
});

const startCooldown = (guildId) => {
  commandCooldowns.add(message.guildId);
  setTimeout(() => {
    commandCooldowns.delete(message.guildId);
  }, 10000);
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id == "1135798027400007711") {
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
  if (message.content == "!스캔") {
    const targetUser = await message.guild.members.fetch(message.author.id);
    const guild = message.guild;
    const guildId = message.guildId;

    let count = 0;

    if (
      !targetUser.permissions.has(PermissionsBitField.Flags.BanMembers) ||
      message.author.id !== "183299738823688192"
    ) {
      message.reply("권한이 없습니다.");
      return;
    }

    if (commandCooldowns.has(guildId)) {
      message.reply("과부하 방지를 위해 10초에 한번만 사용할 수 있습니다.");
      return;
    }

    startCooldown(guildId);
    getdata();

    const fetchedMembers = await guild.members.fetch();

    // fetching members
    const keys = Array.from(fetchedMembers.keys());

    keys.forEach((key) => {
      if (data.includes(key)) {
        ban(fetchedMembers.get(key), guild, message);
        count++;
      }
    });

    if (count == 0) {
      message.reply("스캔 완료. 밴할 사람 없음");
    } else {
      message.reply("스캔 완료. " + count + "명 밴 시작");
    }
  }
});

client.login(config.token);
