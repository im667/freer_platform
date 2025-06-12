// src/services/workService.ts
import { collection, getDocs,query,where } from "firebase/firestore";
import { db } from "../firebase.ts";

export async function fetchWorksData(): Promise<any[]> {

  const domainRef = collection(db, "domain");
  const q = query(domainRef, where("works", "!=", null)); // works가 null이 아닌 문서
  const snapshot = await getDocs(q);
  const excludedEmails = new Set([
  "koh9037@gmail.com",
  "dinoegg2023@gmail.com",
  "asdfasdf@asASdfasdf.cpm",
  "freer.csteam@gmail.com",
  "rrilla01@gmail.com",
].map(email => email.trim().toLowerCase()));
  const docs = snapshot.docs
  .map(doc => doc.data())
  .filter(data => {
   const email = data.user_info?.email?.trim().toLowerCase() ?? "";
  return !excludedEmails.has(email);
  });
  console.log(docs)
  
  return docs
}
