export default function MembershipCard({
  username,
  createdAt,
}: {
  username: string;
  createdAt: string;
}) {
  const joined = new Date(createdAt);
  const joinedLabel = `${joined.getFullYear()}.${String(joined.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="metal-card relative aspect-[1.586] w-full max-w-sm overflow-hidden rounded-[28px] p-7 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="font-brand text-lg tracking-wide">고구마카드</span>
        <span className="text-2xl">🍠</span>
      </div>
      <div className="mt-8 h-8 w-12 rounded-md bg-white/25" />
      <p className="mt-6 text-xl font-semibold tracking-wide">{username}</p>
      <p className="mt-1 text-xs text-white/60">MEMBER SINCE {joinedLabel}</p>
    </div>
  );
}
