'use client';
import { useParams } from 'next/navigation';
import {  useEffect } from 'react';
function Classes() {
  const { id } = useParams();
  useEffect(() => {
    const userdata  = async()=>{
      const response = await fetch(`/dashboard/profile/${id}`)
    }
 userdata() }, []);
  
  return (
    <>
      <h1>{`Welcome to classID of ${id}`}</h1>
    </>
  );
}

export default Classes;