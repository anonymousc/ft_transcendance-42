function ChatWelcome() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-white px-12 dark:bg-zinc-900 lg:px-24 md:bg-gray-50 md:dark:bg-zinc-950">
      <div className="max-w-3xl space-y-6 text-left">
      <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-foreground leading-tight select-none">
  Welcome to
  <br />
  <span className="text-primary">Rihla</span> Messages
</h1>
        <p className="text-muted-foreground text-base">
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
}

export default ChatWelcome;
