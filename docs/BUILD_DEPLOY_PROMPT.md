# Prompt Build & Deploy Toi Uu

Scope: `D:\IVS\Apps\DEVELOPER\acfmart`

Dung prompt nay khi can build local app ACFMart trong `src/`. Mac dinh khong deploy production. Neu can deploy that, phai hoi va duoc nguoi dung xac nhan ro rang truoc.

## Nguyen tac bat buoc

- Giu nguyen ten tool: `get_problems`, `grep_code`, `run_in_terminal`, `edit_file`, `list_dir`.
- Khong map sang tool khac de tranh nham lan.
- Dung `create_memory` neu can luu quyet dinh quan trong, on dinh, co gia tri cho cac lan lam viec sau.
- Package manager chuan cua app trong `src` la `yarn`.
- Khong dung `npm install`, `npm run build`, hoac tao/cap nhat `package-lock.json` cho app trong `src`.
- Neu phat hien `src/package-lock.json` trong qua trinh setup, xoa file nay bang `run_in_terminal` vi app trong `src` da chuan hoa dung `yarn`.
- Khong tu dong sua code khi gap loi. Chi bao cao van de, dung quy trinh, va xin xac nhan truoc khi dung `edit_file`.

## Thu tu thuc hien build local

1. Kiem tra cau truc bang `list_dir`.
   - Xac nhan repo root la `D:\IVS\Apps\DEVELOPER\acfmart`.
   - Xac nhan app frontend nam trong `src`.
   - Xac nhan co `src/package.json`, `src/vite.config.ts`, `src/tsconfig.json`.

2. Xoa cache trong `src` bang `run_in_terminal`.

   ```bash
   cd src
   rm -rf dist node_modules/.vite
   ```

   Khong xoa cache, dependency, hoac build output cua package khac trong monorepo.

3. Chuan hoa package manager va cai dependencies bang `run_in_terminal`.

   ```bash
   cd src
   rm -f package-lock.json
   ```

   ```bash
   cd src
   yarn install
   ```

4. Kiem tra bat buoc truoc build.
   - Chay `get_problems`.
   - Dung `grep_code` de kiem tra import hop le, pattern co rui ro, va cac file lien quan den thay doi.
   - Chay typecheck bang `run_in_terminal`:

     ```bash
     cd src
     yarn tsc --noEmit --skipLibCheck
     ```

   - Kiem tra alias `@/*` dong bo giua TypeScript va Vite:

     ```bash
     cd src
     yarn check-alias-sync
     ```

   Neu bat ky buoc nao co loi, dung quy trinh va bao cao ro: file, dong, thong bao loi, va huong xu ly de xuat. Khong tu sua code neu chua duoc xac nhan.

5. Build project bang `run_in_terminal`.

   ```bash
   cd src
   yarn clean && yarn build
   ```

6. Xac nhan ket qua build bang `list_dir`.
   - Kiem tra `src/dist` ton tai.
   - Kiem tra `src/dist/index.html` ton tai.
   - Kiem tra `src/dist/assets/` ton tai va co output build tu Vite.
   - Neu `src/dist` khong ton tai hoac thieu file chinh, coi build la that bai va bao cao.

## Neu co chinh sua code trong quy trinh

- Chi dung `edit_file` sau khi nguoi dung xac nhan cho phep sua.
- Sau moi lan chinh sua, bat buoc chay `get_problems`.
- Sau khi het problems lien quan, kiem tra import bang `grep_code`.
- Chay lai:

  ```bash
  cd src
  yarn tsc --noEmit --skipLibCheck
  yarn check-alias-sync
  yarn clean && yarn build
  ```

## Deploy that len Firebase Hosting

Mac dinh khong deploy that. Neu nguoi dung yeu cau deploy, phai xac nhan ro:

- Moi truong/du an Firebase: `ecommerce-acf`
- Hosting target duy nhat: `acfmart`
- Lenh deploy:

  ```bash
  firebase deploy --only hosting:acfmart --project ecommerce-acf
  ```

Chi chay lenh deploy sau khi:

- Build local thanh cong.
- `src/dist` da duoc xac nhan.
- Nguoi dung da xac nhan deploy that.

Neu deploy khong duoc phep, chi dung o local build va co the preview local bang:

```bash
cd src
yarn preview
```

## Mau prompt su dung truc tiep

Hay thuc hien quy trinh build local cho `D:\IVS\Apps\DEVELOPER\acfmart`.

Yeu cau bat buoc:

- Giu nguyen tool names: `get_problems`, `grep_code`, `run_in_terminal`, `edit_file`, `list_dir`.
- Dung `create_memory` neu co quyet dinh quan trong can luu lai.
- Khong deploy that len Firebase neu chua co xac nhan rieng.
- Chi lam viec voi frontend app trong `src`.
- Chuan hoa package manager la `yarn`; khong dung `npm`.
- Neu phat hien `src/package-lock.json`, xoa bang `run_in_terminal` trong qua trinh setup.
- Khong tu sua code khi gap loi; bao cao va cho xac nhan truoc khi dung `edit_file`.

Thu tu:

1. Dung `list_dir` kiem tra root va `src`.
2. Dung `run_in_terminal` trong `src`: `rm -rf dist node_modules/.vite`.
3. Dung `run_in_terminal` trong `src`: `rm -f package-lock.json`.
4. Dung `run_in_terminal` trong `src`: `yarn install`.
5. Chay `get_problems`.
6. Dung `grep_code` kiem tra import hop le, pattern co rui ro, va cac file lien quan.
7. Dung `run_in_terminal` trong `src`: `yarn tsc --noEmit --skipLibCheck`.
8. Dung `run_in_terminal` trong `src`: `yarn check-alias-sync`.
9. Neu khong co loi, dung `run_in_terminal` trong `src`: `yarn clean && yarn build`.
10. Dung `list_dir` xac nhan `src/dist/index.html` va `src/dist/assets/` ton tai.
11. Neu deploy khong duoc phep, chi dung o local build va preview local khi can.
12. Bao cao ket qua ngan gon: thanh cong/that bai, cac loi neu co, va buoc tiep theo can nguoi dung xac nhan.
