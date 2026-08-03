export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

/**
 * Porta para hashing de senha — isola o domínio/aplicação da biblioteca
 * concreta usada (bcrypt). Ver BcryptPasswordHasher.
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
