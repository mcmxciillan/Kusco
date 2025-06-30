import React from 'react'

interface HeaderBarProps {
  title: string
  userAvatarUrl?: string
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title, userAvatarUrl }) => {
  return (
    <header className="header-bar">
      <h1>{title}</h1>
      {userAvatarUrl && (
        <img
          src={userAvatarUrl} // Vite handles public assets from the `public` dir or direct imports
          alt="User Avatar"
          className="user-avatar"
        />
      )}
    </header>
  )
}

export default HeaderBar