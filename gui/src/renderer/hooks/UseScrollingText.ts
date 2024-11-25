import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

const useScrollingText = (chatStream: React.MutableRefObject<Subject<string>>) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const subscription = chatStream.current.subscribe({
      next: newText => {
        if (newText === '[DONE]') {
          setDisplayedText('');
        } else {
          setDisplayedText(currText => currText + newText);
        }
      },
      error: err => console.error('Something wrong occurred: ' + err),
      complete: () => console.log('Stream completed.')
    });

    return () => subscription.unsubscribe();
  }, [chatStream]);

  return displayedText;
};

export { useScrollingText };
