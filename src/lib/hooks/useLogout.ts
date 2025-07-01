import { signOut } from "next-auth/react";

export const useLogout = () => {
  const logout = async (options?: {
    callbackUrl?: string;
    showConfirm?: boolean;
    clearLocalStorage?: boolean;
  }) => {
    const {
      callbackUrl = "/auth/signin",
      showConfirm = true,
      clearLocalStorage = true,
    } = options || {};

    if (showConfirm) {
      const confirmed = confirm("ログアウトしますか？");
      if (!confirmed) {
        return;
      }
    }

    try {
      // ローカルストレージをクリア（オプション）
      if (clearLocalStorage) {
        // アプリケーション固有のローカルストレージをクリア
        const keysToRemove = [
          "closet-filter",
          "user-preferences",
          "draft-outfit",
          "temp-uploads",
        ];

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });

        // セッションストレージもクリア
        sessionStorage.clear();
      }

      // NextAuth.jsのログアウト処理
      await signOut({
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
      // エラーが発生してもログアウトページにリダイレクト
      window.location.href = callbackUrl;
    }
  };

  return { logout };
};
