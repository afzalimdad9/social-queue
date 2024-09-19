import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import toast from "react-hot-toast";

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;

export async function initFacebookSdk() {
  await createScriptEle();
  window.fbAsyncInit = () => {
    window.FB.init({
      appId: facebookAppId,
      cookie: true,
      xfbml: true,
      version: "v20.0",
    });

    FB.AppEvents.logPageView();
    // auto authenticate with the api if already logged in with facebook
    window.FB.getLoginStatus(() => {});
  };

  void createScriptEle();
}

const createScriptEle = async () => {
  return new Promise((resolve) => {
    const scriptId = "facebook-jssdk";
    const element = document.getElementsByTagName("script")[0];
    const fjs = element as Element;

    // return if script already exists
    if (document.getElementById(scriptId)) {
      return;
    }

    const js: HTMLScriptElement = document.createElement("script");
    js.id = scriptId;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.onload = resolve;

    fjs.parentNode!.insertBefore(js, fjs);
  });
};

export const loginToFacebook = (
  callback: (res: fb.StatusResponse) => void,
  loginOptions: fb.LoginOptions
) => {
  window.FB.login(callback, loginOptions);
};

export const getInstagramAccountId = ({
  onSuccessCallback,
  logger,
}: {
  onSuccessCallback: (accounts: InstagramAccount[]) => void;
  logger: Logger;
}) => {
  FB.api(
    "/me/accounts",
    "get",
    { fields: "picture{url},name,access_token,instagram_business_account" },
    (response: { error: FacebookGraphError; data: InstagramAccount[] }) => {
      if (response.error) {
        logger.error(errorString, response.error);
        toast.error(
          "Sorry, we had an issue connecting to Facebook. Please try again."
        );
      } else {
        onSuccessCallback(response.data);
      }
    }
  );
};

export type InstagramAccount = {
  access_token: string;
  id: string;
  instagram_business_account: { id: string };
  name: string;
  picture: { data: { url: string } };
};

export type FacebookGraphError = {
  message: string;
  type: string;
  code: number;
  error_subcode: number;
  error_user_title: string;
  error_user_msg: string;
  fbtrace_id: string;
};