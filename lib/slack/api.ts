// Tiny Slack Web API client — only the endpoints we need.

const SLACK_API = "https://slack.com/api";

async function call<T>(method: string, params: Record<string, string>): Promise<T> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN missing");

  const url = `${SLACK_API}/${method}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`slack ${method} HTTP ${res.status}`);
  }

  const data = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!data.ok) {
    throw new Error(`slack ${method}: ${data.error ?? "unknown error"}`);
  }
  return data;
}

export async function getPermalink(channel: string, message_ts: string): Promise<string | null> {
  try {
    const data = await call<{ permalink: string }>("chat.getPermalink", {
      channel,
      message_ts,
    });
    return data.permalink;
  } catch {
    return null;
  }
}

export type SlackUserInfo = {
  id: string;
  name?: string;
  avatar?: string;
};

export async function getUserInfo(user: string): Promise<SlackUserInfo> {
  try {
    const data = await call<{
      user: { id: string; profile: { real_name?: string; display_name?: string; image_72?: string } };
    }>("users.info", { user });
    return {
      id: user,
      name: data.user.profile.display_name || data.user.profile.real_name || user,
      avatar: data.user.profile.image_72,
    };
  } catch {
    return { id: user };
  }
}

export async function getChannelName(channel: string): Promise<string | null> {
  try {
    const data = await call<{ channel: { name?: string } }>("conversations.info", { channel });
    return data.channel.name ?? null;
  } catch {
    return null;
  }
}

// Rewrites <@U123> → <@U123|Display Name> so the mrkdwn renderer can show a
// human-readable label. Slack's own UI does this client-side; we bake it into
// the stored body because we don't keep a user directory locally.
export async function resolveMentions(text: string): Promise<string> {
  if (!text) return text;
  const ids = Array.from(
    new Set(Array.from(text.matchAll(/<@([UW][A-Z0-9]+)>/g), (m) => m[1]))
  );
  if (ids.length === 0) return text;

  const names = new Map<string, string>();
  await Promise.all(
    ids.map(async (id) => {
      const info = await getUserInfo(id);
      if (info.name) names.set(id, info.name);
    })
  );

  return text.replace(/<@([UW][A-Z0-9]+)>/g, (raw, id) => {
    const name = names.get(id);
    return name ? `<@${id}|${name}>` : raw;
  });
}
