// ローディング状態（サーバーコンポーネント）
export function LoadingState() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    </main>
  );
}
