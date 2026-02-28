const TrafficLight = ({ laneId, signal }) => {
  const getLightClass = (light) => {
    if (light === signal) {
      return 'opacity-100 shadow-lg';
    }
    return 'opacity-30';
  };

  return (
    <div className="w-16 h-44 bg-gray-800 rounded-xl p-2 shadow-lg mx-auto">
      <div className={`w-10 h-10 rounded-full mx-auto mb-2 bg-red-500 ${getLightClass('red')}`}></div>
      <div className={`w-10 h-10 rounded-full mx-auto mb-2 bg-yellow-500 ${getLightClass('yellow')}`}></div>
      <div className={`w-10 h-10 rounded-full mx-auto bg-green-500 ${getLightClass('green')}`}></div>
    </div>
  );
};

export default TrafficLight;
