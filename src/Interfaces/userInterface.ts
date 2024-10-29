////userlogin/////

export interface LoginValues {
    email: string;
    password: string;
  }
  
export interface UseLoginReturn {
    loading: boolean;
    error: string | null;
    LoginUser: (values: LoginValues) => Promise<void>; 
    sendResetEmail: (email: string) => Promise<void>;
  }


////userSignup////

export interface SignupValues {
    username: string;
    email: string;
    password: string;
    confirmpassword: string;
  }
  
export interface UseSignupReturn {
    loading: boolean | null;
    error: string | null;
    registerUser: (values: SignupValues) => Promise<void>;
  }
  


  