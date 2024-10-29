
 export interface User {
    _id: string;
    username: string;
    bio: string;
    email:string;
    profilePicture: string;
    isPrivate: boolean;
    followers: string[];
    requests: string[];
    following: string[];
    blockedMe: string[];
    blocked: boolean;
  }

  export interface EditProfileFormProps {
    closeForm: () => void;
  }

  export interface SwitchProps{
    isPrivate:boolean;
    onChange: any;
  }