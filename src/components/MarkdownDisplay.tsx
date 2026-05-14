import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MarkdownDisplayProps {
  filePath: string;
  title: string;
}

export function MarkdownDisplay({ filePath, title }: MarkdownDisplayProps) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        // Convert markdown to basic HTML
        let html = text
          .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-4">$1</h1>') // h1
          .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-3 mt-4">$1</h2>') // h2
          .replace(/^### (.*$)/gim, '<h3 class="font-medium mb-2">$1</h3>') // h3
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // bold
          .replace(/\*(.*)\*/gim, '<em>$1</em>') // emphasis
          .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />') // image
          .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>') // link
          .replace(/\n$/gim, '<br />'); // line break

        // Wrap paragraphs
        html = `<p>${html.split('<br /><br />').join('</p><p>')}</p>`;
        
        setContent(html);
      })
      .catch(error => {
        console.error('Error loading markdown file:', error);
        setContent('<p>Không thể tải nội dung. Vui lòng thử lại sau.</p>');
      });
  }, [filePath]);

  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          ← Về trang chủ
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-6">{title}</h1>
        
        <div 
          className="prose prose-sm max-w-none text-neutral-700"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    </div>
  );
}