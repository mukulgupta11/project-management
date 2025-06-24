import React, { useEffect, useState } from 'react'

const GreetingDisplay = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening"); // Covers both 17–24 and 0–5
    }
  }, []);

  return (
    <span className='text-blue-600'>{greeting}</span>
  )
}

export default GreetingDisplay;
