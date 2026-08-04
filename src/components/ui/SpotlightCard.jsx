"use client";
import React from 'react';

export default function SpotlightCard({
  children,
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      <span className="relative block h-full">{children}</span>
    </Tag>
  );
}
