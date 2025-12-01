// src/components/InitialsCircle.tsx

import React from 'react';

interface InitialsCircleProps {
  fullname?: string;
  size?: number; // opcional: tamaño del círculo
  bgColor?: string; // opcional: color de fondo
  textColor?: string; // opcional: color del texto
}

const InitialsCircle: React.FC<InitialsCircleProps> = ({
  fullname,
  size = 50,
  bgColor = '#007bff',
  textColor = '#fff'
}) => {
  const safeName = (fullname || 'Usuario').toString();
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: `${size * 0.2}px`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
};

export default InitialsCircle;
