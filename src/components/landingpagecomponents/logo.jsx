const Logo = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 250 100"
        className="w-full h-full max-w-[120px] max-h-[50px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(-30, 0)">
          <line x1="20" y1="0" x2="290" y2="0" stroke="#F0EAD6" strokeWidth="3" />
  
          <text
            x="155"
            y="58"
            fontFamily="Arial, sans-serif"
            fontSize="60"
            fontWeight="bold"
            textAnchor="middle"
            fill="#F0EAD6"
          >
            MEMInc
          </text>
  
          <line x1="20" y1="75" x2="290" y2="75" stroke="#F0EAD6" strokeWidth="3" />
  
          <text x="155" y="100" fontFamily="Arial, sans-serif" fontSize="15" textAnchor="middle" fill="#F0EAD6">
            Farm to fork - The best cuts for you
          </text>
        </g>
      </svg>
    )
  }
  
export default Logo
  