// Error State
type ErrorState = {
  type: 'network' | 'server' | 'timeout';
  message: string;
};

// User
type LoggedInUser = {
  isLoggedIn: true;
  email?: string;
  name?: string;
  error?: ErrorState;
};

type LoggedOutUser = {
  isLoggedIn: false;
};

// Account
type Account = {
  name: string;
  IBAN: string;
};

type RegularAccount = Account & {
  type: 'regular';
  currency: 'DKK';
  amount: number;
};

type Pocket = {
  currency: 'DKK' | 'SEK' | 'NOK' | 'USD' | 'EUR';
  amount: number;
};

type PocketAccount = Account & {
  type: 'pocket';
  pockets: [Pocket, ...Pocket[]];
};

// Page Loading States
type LoadingState = {
  isLoading: boolean;
  error?: ErrorState;
};

// Chat States
type ChatWindow = {
  queuePosition?: number;
  isQueueTooLong?: boolean;
  lessBusyTimes?: string[];
  messages?: string[];
  newUserMessage?: string;
  isChatConnecting?: boolean;
};

type SupportChatWindow = ChatWindow & {
  status: 'full-screen';
  open: boolean;
};

type AccountChatWindow = ChatWindow & {
  status: 'minimized' | 'open';
  newMessages: boolean;
};

type Page = {
  loadingState: LoadingState;
  type: 'support' | 'accounts';
  chatWindow?: SupportChatWindow | AccountChatWindow;
};

// Support Page State
type SupportPageState = Page & {
  type: 'support';
  chatWindow?: SupportChatWindow;
};

// Accounts Page State
type AccountsPageState = Page & {
  type: 'accounts';
  chatWindow?: AccountChatWindow;
};

type LoadedAccountsPageState = AccountsPageState & {
  loadingState: {
    isLoading: false;
  };
  regularAccounts?: [RegularAccount, ...RegularAccount[]];
  pocketAccounts?: PocketAccount[];
};

type ErrorAccountsPageState = AccountsPageState & {
  loadingState: {
    isLoading: false;
    error: ErrorState;
  };
};

type AccountsPage = LoadedAccountsPageState | ErrorAccountsPageState;

type LoadedSupportPageState = SupportPageState & {
  loadingState: {
    isLoading: false;
  };
};

type ErrorSupportPageState = SupportPageState & {
  loadingState: {
    isLoading: false;
    error: ErrorState;
  };
};

type SupportPage = LoadedSupportPageState | ErrorSupportPageState;

// AppState
type AppState = {
  user: LoggedInUser | LoggedOutUser;
  pageState: SupportPage | AccountsPage;
};
