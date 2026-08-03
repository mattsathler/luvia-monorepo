export type AccountProps = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

/**
 * Ver docs/decisions/0014-autenticacao-jwt-email-senha.md.
 * O domínio nunca lida com senha em texto puro nem com bcrypt — recebe o
 * hash já pronto (ver PasswordHasher).
 */
export class Account {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }

  static create(props: { email: string; passwordHash: string }, id: string, now: Date = new Date()): Account {
    return new Account({
      id,
      email: props.email.trim().toLowerCase(),
      passwordHash: props.passwordHash,
      createdAt: now,
    });
  }
}
