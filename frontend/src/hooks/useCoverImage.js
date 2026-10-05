import { useState, useEffect, useCallback, useRef } from 'react';

const openLibraryIsbnCover = (isbn) => {
  if (!isbn) return null;
  const clean = String(isbn).replace(/[^0-9Xx]/g, '');
  if (clean.length < 10) return null;
  return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg?default=false`;
};

const searchCoverByTitle = async (title) => {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1&fields=cover_i`);
    if (!res.ok) return null;
    const data = await res.json();
    const coverId = data && data.docs && data.docs[0] && data.docs[0].cover_i;
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
  } catch (err) {
    return null;
  }
};

export const useCoverImage = (book) => {
  const [src, setSrc] = useState(null);
  const [idx, setIdx] = useState(0);
  const [searchTried, setSearchTried] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const candidates = useRef([]);

  useEffect(() => {
    const list = [];
    const add = (u) => {
      if (u && !list.includes(u)) list.push(u);
    };
    if (book) {
      add(book.coverImage);
      if (book.coverImage && book.coverImage.startsWith('http://')) {
        add('https://' + book.coverImage.slice(7));
      }
      add(book.imageUrl);
      add(openLibraryIsbnCover(book.isbn));
    }
    candidates.current = list;
    setIdx(0);
    setSearchTried(false);
    setExhausted(false);
    setSrc(list[0] || null);
  }, [book?.id, book?.coverImage, book?.imageUrl, book?.isbn]);

  const onError = useCallback(() => {
    const next = idx + 1;
    if (next < candidates.current.length) {
      setIdx(next);
      setSrc(candidates.current[next]);
      return;
    }
    if (!searchTried && book?.title) {
      setSearchTried(true);
      searchCoverByTitle(book.title).then((found) => {
        if (found) setSrc(found);
        else setExhausted(true);
      });
    } else {
      setExhausted(true);
    }
  }, [idx, searchTried, book?.title]);

  return { src: exhausted ? null : src, onError };
};
