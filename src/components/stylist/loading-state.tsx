// スタイリスト用ローディング状態（サーバーコンポーネント）
export function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 bg-accent rounded-lg animate-pulse mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-sm">👩‍💼</span>
        </div>
        <p className="text-muted-foreground">スタイリスト画面を読み込み中...</p>
      </div>
    </div>
  );
}
