"use server";
import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { FacebookGraphError } from "@/utils/facebookSdk";
import { createClient } from "@/utils/supabase/server";

export const saveInstagramAccount = async (prevState: any, data: FormData) => {
  const appScopedUserId = data.get("appScopedUserId") as string;
  const shortLivedAccessToken = data.get("shortLivedAccessToken") as string;
  const instagramBusinessAccountId = data.get(
    "instagramBusinessAccountId"
  ) as string;
  const facebookPageId = data.get("facebookPageId") as string;
  const instagramAccountName = data.get("instagramAccountName") as string;
  const pictureUrl = data.get("pictureUrl") as string;
  const userId = data.get("userId") as string;
  let logger = new Logger().with({
    appScopedUserId,
    shortLivedAccessToken,
    instagramBusinessAccountId,
    facebookPageId,
    instagramAccountName,
    pictureUrl,
    userId,
  });
  try {
    const { instagramUsername } = await fetchInstagramUsernameFromPageId({
      instagramBusinessAccountId,
      shortLivedAccessToken,
    });
    logger = logger.with({ instagramUsername });
    const { longLivedAccessToken } = await fetchLongLivedAccessToken(
      shortLivedAccessToken
    );
    logger = logger.with({ longLivedAccessToken });
    const supabase = createClient();
    const { error } = await supabase.from("instagram-accounts").insert({
      account_name: instagramAccountName,
      facebook_page_id: facebookPageId,
      instagram_business_account_id: instagramBusinessAccountId,
      access_token: longLivedAccessToken,
      picture_url: pictureUrl,
      user_id: userId,
    });
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error connecting your Instagram account. Please try again.",
      };
    }
  } catch (error) {
    await logger.flush();
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    return {
      error:
        "Sorry, we ran into an error connecting your Instagram account. Please try again.",
    };
  } finally {
    await logger.flush();
  }

  return { data: "Successfully added Instagram account", error: null };
};

const fetchInstagramUsernameFromPageId = async ({
  instagramBusinessAccountId,
  shortLivedAccessToken,
}: {
  instagramBusinessAccountId: string;
  shortLivedAccessToken: string;
}) => {
  const logger = new Logger().with({
    function: "fetchInstagramUsernameFromPageId",
    instagramBusinessAccountId,
    shortLivedAccessToken,
  });
  const fields = "username";
  const response = await fetch(
    `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}/${instagramBusinessAccountId}?
        fields=${fields}&access_token=${shortLivedAccessToken}`
  );
  const data = (await response.json()) as {
    error: FacebookGraphError;
    username: string;
  };
  logger.info("Fetched Instagram account data", data);
  if (data.error) {
    logger.error(errorString, data.error);
    await logger.flush();
    throw new Error("Failed fetching Instagram business account from page id");
  }
  await logger.flush();
  return {
    instagramUsername: data.username,
  };
};

const fetchLongLivedAccessToken = async (shortLivedAccessToken: string) => {
  const logger = new Logger().with({
    function: "fetchLongLivedAccessToken",
    shortLivedAccessToken,
  });
  const response = await fetch(
    `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?
      grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&
      client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&
      fb_exchange_token=${shortLivedAccessToken}`,
    {
      method: "GET",
    }
  );
  const data = (await response.json()) as {
    error: FacebookGraphError;
    access_token: string;
  };
  logger.info("Fetched long lived access token", data);
  if (data.error) {
    logger.error(errorString, data.error);
    await logger.flush();
    throw new Error("Failed fetching long lived access token");
  }
  await logger.flush();
  return {
    longLivedAccessToken: data.access_token,
  };
};