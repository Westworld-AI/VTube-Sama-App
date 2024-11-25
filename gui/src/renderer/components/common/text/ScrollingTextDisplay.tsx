// ScrollingTextDisplay.tsx
import React from 'react';
import {Subject} from 'rxjs';
import {useScrollingText} from '../../../hooks/UseScrollingText';

interface ScrollingTextDisplayProps {
  chatStream: React.MutableRefObject<Subject<string>>;
}

const ScrollingTextDisplay: React.FC<ScrollingTextDisplayProps> = ({chatStream}) => {
  const displayedText = useScrollingText(chatStream);
  // 当 displayedText 有数据时，添加 w-full 类，否则为空字符串
  const widthClassName = displayedText ? 'w-full' : '';
  return (
    <div>
      {displayedText ? (
        <div
          className={`${widthClassName} fixed bottom-0 right-0 z-50 max-h-40 overflow-y-auto mb-2.5 bg-white bg-opacity-30 shadow-lg text-2xl text-with-white-border rounded-3xl p-2`}>
          {displayedText}
        </div>
      ) : <></>}
    </div>
  );
};

export default ScrollingTextDisplay;
