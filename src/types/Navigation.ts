export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  RequestDetail: {
    requestId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  CreateRequest: undefined;
  Profile: undefined;
};
