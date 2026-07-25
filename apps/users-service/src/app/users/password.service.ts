import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

/** Hashes and verifies user passwords. */
@Injectable()
export class PasswordService {
  private readonly rounds = 12;

  hash(plain: string): Promise<string> {
    return hash(plain, this.rounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
