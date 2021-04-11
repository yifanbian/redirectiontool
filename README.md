# Redirection Tool

[![GitHub Action status](https://github.com/bianyifan/redirectiontool/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/bianyifan/redirectiontool/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/bianyifan/redirectiontool/branch/main/graph/badge.svg?token=H3MPGX46V9)](https://codecov.io/gh/bianyifan/redirectiontool)

A redirection tool, just like `aka.ms`.

## Usage

Assuming the redirection tool is deployed under domain `contoso.com`.
In `wrangler.toml`, we are routing requests to `https://contoso.com/*` or `https://aka.contoso.com/*` to this tool.

Assuming you have a rule of redirecting `/msft` to `https://finance.yahoo.com/quote/MSFT`. So, when users are navigating to `https://contoso.com/msft` or `https://aka.contoso.com/msft`, they will get a HTTP response with status 302 to `https://finance.yahoo.com/quote/MSFT`.

## Deploy

1. If you don't have a Cloudflare account, create one.
2. Go to [Cloudflare Profile - API Token](https://dash.cloudflare.com/profile/api-tokens) and create a API token with these permissions:
  - Workers KV Storage:Read
  - Workers Scripts:Edit
  - Account Settings:Read
  - Workers Routes:Edit
  - User Details:Read
3. Put the value of Cloudflare API Token in GitHub Actions Secret with name `CF_API_TOKEN`
4. Go to Cloudflare Workers KV, and add a KV Namespace for this tool, copy the namespace ID and put it in GitHub Actions Secret with name `CF_KV_NAMESPACE`.
5. If you are using a private repository, go to [Codecov](https://codecov.io), activate this repository (or your forked repository) and copy Repository Upload Token, then put the value of that token in GitHub Actions Secret with name `CODECOV_TOKEN`.
6. Add these GitHub Actions secrets:
  - `CF_ACCOUNT_ID`: Your Cloudflare account ID
  - `CF_ZONE_ID`: Zone ID on Cloudflare that you'll be deploying to
  - `CF_DOMAIN`: Your domain name, such as `contoso.com`
  - `CF_KV_NAMESPACE`: Your Cloudflare Workers KV Namespace ID
7. Add DNS records:
  - An AAAA record for `@` (`contoso.com.`) to `100::` and proxy through Cloudflare
  - An AAAA record for `aka` (`aka.contoso.com.`) to `100::` and proxy through Cloudflare
8. Run GitHub Actions workflow in this repository, now this tool should be deployed to your Cloudflare account.
9. Add rules in Cloudflare Workers KV Namespace you just created.
  - The key is the request path, leading with a slash, such as `/`, `/test`.
  - The value is the URL that users will be redirected to, should be a absolute URL. Relative URLs are also accepted but you should use relative URLs with caution.

## License

See [LICENSE](LICENSE).
