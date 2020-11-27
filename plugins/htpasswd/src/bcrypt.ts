import {bcrypt as decryptor } from 'bcrypt';

export default function bcrypt(key: string, hash: string): boolean {
    return decryptor.compare(key, hash);
}
