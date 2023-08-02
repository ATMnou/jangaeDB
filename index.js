const axios = require("axios");
const {
  Client,
  Interaction,
  Events,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const config = require("./config.json");
const json = "http://210.117.212.41:4000/jangae";
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

function isAdmin(msg) {
  return msg.member.permissionsIn(msg.channel).has("ADMINISTRATOR");
}

async function ban(user, guild, msg) {
  const exampleEmbed = new EmbedBuilder()
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
  let targetUser = user;
  if (typeof user == "string") {
    targetUser = await guild.members.fetch(user);
  }
  reason = "jangaeDB : 자동 밴";
  targetUser.send({ embeds: [exampleEmbed] }).then(async () => {
    try {
      await targetUser.ban({ reason });
      if (msg) {
        msg.reply(targetUser.user.username + "님을 밴했습니다.");
      }
    } catch (error) {
      console.log(`There was an error when banning: ${error}`);
    }
  });
}

client.on("ready", () => {
  console.log(`봇 켜짐 : ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: `건국대학교 만세`, type: ActivityType.Playing }],
    status: "online",
  });
  getdata();
});

process.on("uncaughtException", (err) => {
  console.log("General error:", err.message);
  console.log(err);
});

async function getdata() {
  const res = await axios.get(json);
  for (let i = 0; i < res.data.length; i++) {
    data.push(res.data[i].target_id);
  }
}

client.on("guildMemberAdd", async (member) => {
  if (
    data.includes(member.user.id) &&
    member.guild.id != "1135788320681623562"
  ) {
    // console.log(typeof member);
    ban(member.user.id, member.guild, null);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id == "1135798027400007711") {
    if (!data.includes(message.content)) {
      axios
        .post(json, {
          target_id: message.content,
          author:
            message.author.id == "183299738823688192"
              ? "ADMIN"
              : message.author.id,
        })
        .then(() => {
          message.react("✅");
          getdata();
        });
    } else {
      message.react("❌");
    }
  }
  if (message.content == "!스캔") {
    if (message.author.id == "183299738823688192") {
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
            message.reply("스캔 완료. 밴할 사람 없음");
          } else {
            message.reply("스캔 완료. " + count + "명 밴 시작");
          }
        });
    }
  }
});

client.login(config.token);
