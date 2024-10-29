import React from "react";
import { SwitchProps } from "../../Interfaces/profileInterface";
import {  IconButton } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const Switch: React.FC<SwitchProps> = ({ isPrivate, onChange }) => {
  return (
    <IconButton
      onClick={() => onChange(!isPrivate)}
      sx={{
        backgroundColor: isPrivate ? '#20cca5' : '#ff5b5b',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        position: 'relative',
        '&:hover': {
          backgroundColor: isPrivate ? '#1bb593' : '#ff4747', 
        },
      }}
    >
      {isPrivate ? (
        <LockIcon sx={{ color: '#fff', fontSize: 36 }} />
      ) : (
        <LockOpenIcon sx={{ color: '#fff', fontSize: 36 }} />
      )}
    </IconButton>
  );
};

export default Switch;
