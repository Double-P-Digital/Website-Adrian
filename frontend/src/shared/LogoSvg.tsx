const LogoSvg = () => {
  return (
    <img 
      src="/logos.svg" 
      alt="Logo" 
      className="w-full h-full"
      style={{ 
        imageRendering: '-webkit-optimize-contrast',
        WebkitFontSmoothing: 'antialiased',
        shapeRendering: 'crispEdges'
      }}
    />
  )
}

export default LogoSvg
