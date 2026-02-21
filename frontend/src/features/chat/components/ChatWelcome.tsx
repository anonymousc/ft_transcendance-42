function ChatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-12 bg-white dark:bg-zinc-950">
      <div className="max-w-xl mx-auto space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight select-none">
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
