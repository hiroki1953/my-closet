// コーディネート提案ヘッダー（サーバーコンポーネント）

interface OutfitsHeaderProps {
  stylistName?: string;
}

export function OutfitsHeader({
  stylistName = "スタイリスト",
}: OutfitsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          コーディネート提案
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {stylistName}からのパーソナライズされたスタイリング提案
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-full flex items-center justify-center">
          <span className="text-xl md:text-2xl">👩‍💼</span>
        </div>
        <div>
          <p className="text-xs md:text-sm text-muted-foreground">提案者</p>
          <p className="text-sm md:text-base font-semibold text-accent">
            {stylistName}
          </p>
        </div>
      </div>
    </div>
  );
}
